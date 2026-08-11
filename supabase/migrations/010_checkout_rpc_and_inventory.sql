-- 1. Add inventory tracking to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory_count INTEGER DEFAULT 1000;

-- 2. Create idempotency keys table to prevent double orders
CREATE TABLE IF NOT EXISTS idempotency_keys (
  idempotency_key UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE
);

-- Index to clean up old keys if necessary
CREATE INDEX IF NOT EXISTS idx_idempotency_created_at ON idempotency_keys(created_at);

-- 3. Create the secure atomic checkout RPC
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
BEGIN
  -- 1. Check idempotency
  IF EXISTS (SELECT 1 FROM idempotency_keys WHERE idempotency_key = p_idempotency_key) THEN
    RAISE EXCEPTION 'Idempotency key already exists. Duplicate request detected.';
  END IF;

  -- 2. Validate and calculate cart items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(id UUID, quantity INTEGER)
  LOOP
    -- Lock the product row for update to prevent concurrent inventory overselling
    SELECT id, price, title, inventory_count INTO v_product 
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

    v_subtotal := v_subtotal + (v_product.price * v_item.quantity);
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
    SELECT id, price, title INTO v_product FROM products WHERE id = v_item.id;
    
    INSERT INTO order_items (
      order_id, product_id, title, price, quantity, total_price
    ) VALUES (
      v_order_id,
      v_product.id,
      v_product.title,
      v_product.price,
      v_item.quantity,
      v_product.price * v_item.quantity
    );
  END LOOP;

  -- 6. Save Idempotency Key
  INSERT INTO idempotency_keys (idempotency_key, order_id) VALUES (p_idempotency_key, v_order_id);

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id);
END;
$$;
