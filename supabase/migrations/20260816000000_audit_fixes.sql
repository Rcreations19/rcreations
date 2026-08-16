-- =====================================================
-- R Creation Enterprise E-Commerce Database Schema
-- Migration: Wholesale Pricing & Rate Limiting Fixes
-- =====================================================

-- 1. Create table for Rate Limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  ip TEXT PRIMARY KEY,
  count INT NOT NULL DEFAULT 1,
  reset_time TIMESTAMPTZ NOT NULL
);

-- 2. Create RPC for atomic rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(p_ip TEXT, p_limit INT, p_window_ms INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_reset_time TIMESTAMPTZ;
  v_count INT;
BEGIN
  SELECT count, reset_time INTO v_count, v_reset_time
  FROM public.rate_limits
  WHERE ip = p_ip;

  IF NOT FOUND THEN
    INSERT INTO public.rate_limits (ip, count, reset_time)
    VALUES (p_ip, 1, v_now + (p_window_ms || ' milliseconds')::interval);
    RETURN TRUE;
  END IF;

  IF v_now > v_reset_time THEN
    -- Reset window
    UPDATE public.rate_limits
    SET count = 1,
        reset_time = v_now + (p_window_ms || ' milliseconds')::interval
    WHERE ip = p_ip;
    RETURN TRUE;
  END IF;

  IF v_count >= p_limit THEN
    RETURN FALSE;
  END IF;

  UPDATE public.rate_limits
  SET count = count + 1
  WHERE ip = p_ip;

  RETURN TRUE;
END;
$$;

-- Protect the function from public/client access
REVOKE ALL ON FUNCTION check_rate_limit FROM PUBLIC;
REVOKE ALL ON FUNCTION check_rate_limit FROM anon;
REVOKE ALL ON FUNCTION check_rate_limit FROM authenticated;
-- Note: the service_role key will still have access to execute this.


-- 3. Update process_checkout RPC to handle wholesale pricing
CREATE OR REPLACE FUNCTION process_checkout(
  p_idempotency_key UUID,
  p_order_data JSONB,
  p_cart_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_item RECORD;
  v_product RECORD;
  v_subtotal NUMERIC := 0;
  v_total NUMERIC := 0;
  v_tax_amount NUMERIC := 0;
  v_shipping_cost NUMERIC := 0;
  v_price NUMERIC := 0;
BEGIN
  -- 1. Check idempotency
  IF EXISTS (SELECT 1 FROM idempotency_keys WHERE idempotency_key = p_idempotency_key) THEN
    RAISE EXCEPTION 'Idempotency key already exists. Duplicate request detected.';
  END IF;

  -- 2. Validate and calculate cart items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(id UUID, quantity INTEGER)
  LOOP
    -- Lock the product row for update to prevent concurrent inventory overselling
    SELECT id, price, wholesale_price, moq, title, inventory_count INTO v_product 
    FROM products 
    WHERE id = v_item.id 
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found.', v_item.id;
    END IF;

    IF v_product.inventory_count IS NOT NULL AND v_product.inventory_count < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient inventory for product % (%). Requested: %, Available: %', v_product.id, v_product.title, v_item.quantity, v_product.inventory_count;
    END IF;

    -- Update inventory
    UPDATE products 
    SET inventory_count = inventory_count - v_item.quantity 
    WHERE id = v_item.id;

    -- Determine applicable price (Retail vs Wholesale)
    IF v_item.quantity >= v_product.moq AND v_product.wholesale_price > 0 THEN
      v_price := v_product.wholesale_price;
    ELSE
      v_price := v_product.price;
    END IF;

    v_subtotal := v_subtotal + (v_price * v_item.quantity);
  END LOOP;

  -- 3. Calculate final totals
  v_tax_amount := v_subtotal * 0.18;
  IF v_subtotal > 10000 THEN
    v_shipping_cost := 0;
  ELSE
    v_shipping_cost := 500;
  END IF;
  v_total := v_subtotal + v_tax_amount + v_shipping_cost;

  -- 4. Insert Order
  INSERT INTO orders (
    order_number, customer_name, phone, email, address, city, pincode, state,
    subtotal, shipping_cost, tax_amount, total, is_guest, customer_id
  ) VALUES (
    p_order_data->>'order_number',
    p_order_data->>'customer_name',
    p_order_data->>'phone',
    p_order_data->>'email',
    p_order_data->>'address',
    p_order_data->>'city',
    p_order_data->>'pincode',
    p_order_data->>'state',
    v_subtotal,
    v_shipping_cost,
    v_tax_amount,
    v_total,
    (p_order_data->>'is_guest')::boolean,
    NULLIF(p_order_data->>'customer_id', '')::UUID
  ) RETURNING id INTO v_order_id;

  -- 5. Insert Order Items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(id UUID, quantity INTEGER)
  LOOP
    SELECT id, price, wholesale_price, moq, title INTO v_product FROM products WHERE id = v_item.id;
    
    -- Determine applicable price again for order_items record
    IF v_item.quantity >= v_product.moq AND v_product.wholesale_price > 0 THEN
      v_price := v_product.wholesale_price;
    ELSE
      v_price := v_product.price;
    END IF;

    INSERT INTO order_items (
      order_id, product_id, title, price, quantity
    ) VALUES (
      v_order_id,
      v_product.id,
      v_product.title,
      v_price,
      v_item.quantity
    );
  END LOOP;

  -- 6. Save Idempotency Key
  INSERT INTO idempotency_keys (idempotency_key, order_id) VALUES (p_idempotency_key, v_order_id);

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id);
END;
$$;
