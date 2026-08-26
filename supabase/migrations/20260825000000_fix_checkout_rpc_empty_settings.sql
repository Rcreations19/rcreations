-- 1. Update process_checkout RPC to fetch delivery_charge and free_shipping_threshold from site_settings safely
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
  v_setting RECORD;
  v_delivery_charge NUMERIC := 500;
  v_free_shipping_threshold NUMERIC := 10000;
BEGIN
  -- Fetch dynamic settings
  FOR v_setting IN SELECT key, value FROM site_settings WHERE key IN ('delivery_charge', 'free_shipping_threshold')
  LOOP
    IF v_setting.key = 'delivery_charge' THEN
      v_delivery_charge := COALESCE(NULLIF(v_setting.value->>'text', '')::NUMERIC, 500);
    ELSIF v_setting.key = 'free_shipping_threshold' THEN
      v_free_shipping_threshold := COALESCE(NULLIF(v_setting.value->>'text', '')::NUMERIC, 10000);
    END IF;
  END LOOP;

  -- 1. Check idempotency
  IF EXISTS (SELECT 1 FROM idempotency_keys WHERE idempotency_key = p_idempotency_key) THEN
    RAISE EXCEPTION 'Idempotency key already exists. Duplicate request detected.';
  END IF;

  -- 2. Validate and calculate cart items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(id TEXT, quantity INTEGER, type TEXT, price NUMERIC, title TEXT, details TEXT, custom_config JSONB)
  LOOP
    IF v_item.type = 'catalog' OR v_item.type IS NULL THEN
      -- Lock the product row for update to prevent concurrent inventory overselling
      SELECT id, price, wholesale_price, moq, title, inventory_count INTO v_product 
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

      -- Determine applicable price (Retail vs Wholesale)
      IF v_item.quantity >= v_product.moq AND v_product.wholesale_price > 0 THEN
        v_price := v_product.wholesale_price;
      ELSE
        v_price := v_product.price;
      END IF;

      v_subtotal := v_subtotal + (v_price * v_item.quantity);
    ELSIF v_item.type = 'custom' THEN
      -- For custom items, trust the frontend calculated price and skip inventory deduction
      IF v_item.price IS NULL OR v_item.price <= 0 THEN
        RAISE EXCEPTION 'Invalid price for custom item %', v_item.id;
      END IF;
      v_subtotal := v_subtotal + (v_item.price * v_item.quantity);
    END IF;
  END LOOP;

  -- 3. Calculate final totals
  v_tax_amount := v_subtotal * 0.18;
  IF v_free_shipping_threshold > 0 AND v_subtotal >= v_free_shipping_threshold THEN
    v_shipping_cost := 0;
  ELSE
    v_shipping_cost := v_delivery_charge;
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
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(id TEXT, quantity INTEGER, type TEXT, price NUMERIC, title TEXT, details TEXT, custom_config JSONB)
  LOOP
    IF v_item.type = 'catalog' OR v_item.type IS NULL THEN
      SELECT id, price, wholesale_price, moq, title INTO v_product FROM products WHERE id = v_item.id::UUID;
      
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
    ELSIF v_item.type = 'custom' THEN
      INSERT INTO order_items (
        order_id, product_id, title, price, quantity, details, custom_config
      ) VALUES (
        v_order_id,
        NULL,
        COALESCE(v_item.title, 'Custom Frame'),
        v_item.price,
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
