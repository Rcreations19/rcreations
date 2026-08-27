-- Fix for checkout RPC to support custom configured items that are not in the products table
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
  -- Notice we extract id as TEXT so it doesn't fail parsing string IDs like "custom-frame-123"
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(id TEXT, quantity INTEGER, type TEXT, price NUMERIC, title TEXT, custom_config JSONB, details TEXT)
  LOOP
    IF v_item.type = 'custom' THEN
      -- Custom items are generated dynamically and don't exist in the products table.
      -- We trust the frontend price/title for custom configurations in this initial implementation.
      IF v_item.price IS NULL OR v_item.price <= 0 THEN
         RAISE EXCEPTION 'Invalid price for custom item: %', v_item.id;
      END IF;
      v_subtotal := v_subtotal + (v_item.price * v_item.quantity);
    ELSE
      -- Standard catalog product validation
      -- We can safely cast v_item.id to UUID here because it's a catalog product
      SELECT id, price, title, inventory_count INTO v_product 
      FROM products 
      WHERE id = v_item.id::UUID 
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
      WHERE id = v_item.id::UUID;

      v_subtotal := v_subtotal + (v_product.price * v_item.quantity);
    END IF;
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
    COALESCE(p_order_data->>'state', 'Tamil Nadu'),
    v_subtotal,
    v_shipping_cost,
    v_tax_amount,
    v_total,
    COALESCE((p_order_data->>'is_guest')::boolean, true),
    NULLIF(p_order_data->>'customer_id', '')::UUID
  ) RETURNING id INTO v_order_id;

  -- 5. Insert Order Items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(id TEXT, quantity INTEGER, type TEXT, price NUMERIC, title TEXT, custom_config JSONB, details TEXT)
  LOOP
    IF v_item.type = 'custom' THEN
      INSERT INTO order_items (
        order_id, product_id, title, price, quantity, details, custom_config
      ) VALUES (
        v_order_id,
        NULL, -- custom items have no product ID
        v_item.title,
        v_item.price,
        v_item.quantity,
        v_item.details,
        v_item.custom_config
      );
    ELSE
      -- Fetch catalog product again to get accurate title/price if needed, 
      -- or just use what we validated in step 2. We'll fetch again to be 100% safe against payload spoofing.
      SELECT id, price, title INTO v_product FROM products WHERE id = v_item.id::UUID;
      
      INSERT INTO order_items (
        order_id, product_id, title, price, quantity, details, custom_config
      ) VALUES (
        v_order_id,
        v_product.id,
        v_product.title,
        v_product.price,
        v_item.quantity,
        v_item.details,
        v_item.custom_config
      );
    END IF;
  END LOOP;

  -- 6. Save Idempotency Key
  INSERT INTO idempotency_keys (idempotency_key, order_id) VALUES (p_idempotency_key, v_order_id);

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id);
END;
$$;
