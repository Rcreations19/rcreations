'use server';

import { createClient } from '../supabase/server';
import { rateLimit } from '../rate-limit';

import { z } from 'zod';

const checkoutSchema = z.object({
  name: z.string().min(1).max(100, "Name is too long"),
  email: z.string().email().max(255, "Email is too long"),
  phone: z.string().min(10).max(20, "Phone is too long"),
  address: z.string().min(1).max(500, "Address is too long"),
  city: z.string().min(1).max(100, "City is too long"),
  state: z.string().min(1).max(100, "State is too long"),
  pincode: z.string().min(1).max(20, "Pincode is too long"),
});

const cartSchema = z.array(z.object({
  id: z.string().uuid(),
  quantity: z.number().int().positive()
})).min(1, "Cart is empty");

export async function submitOrder(
  rawFormData: { name: string; email: string; phone: string; address: string; city: string; state: string; pincode: string },
  rawCartItems: { id: string; quantity: number }[],
  idempotencyKey: string
) {
  const rl = await rateLimit(5, 60000); // 5 orders per minute
  if (!rl.success) {
    return { error: rl.error };
  }

  // Runtime validation
  let formData;
  let cartItems;
  try {
    formData = checkoutSchema.parse(rawFormData);
    cartItems = cartSchema.parse(rawCartItems);
  } catch (err) {
    console.error("Checkout validation failed:", err);
    return { error: "Invalid checkout payload." };
  }

  // We use the standard client so it respects Row Level Security and standard session contexts.
  // The actual database insertion is handled securely by the `process_checkout` RPC which is set to `SECURITY DEFINER`.
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  const customerId = user?.id || null;

  // Generate a unique order number
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

  const orderData = {
    order_number: orderNumber,
    customer_name: formData.name,
    phone: formData.phone,
    email: formData.email,
    address: formData.address,
    city: formData.city,
    pincode: formData.pincode,
    state: formData.state || 'Tamil Nadu',
    is_guest: !customerId,
    customer_id: customerId,
  };

  const { error } = await userClient.rpc('process_checkout', {
    p_idempotency_key: idempotencyKey,
    p_order_data: orderData,
    p_cart_items: cartItems
  });

  if (error) {
    console.error(JSON.stringify({
      event: 'checkout_rpc_failure',
      error: error,
      idempotencyKey,
      orderNumber,
      customerId,
      timestamp: new Date().toISOString()
    }));
    return { error: error.message };
  }

  return { success: true, orderId: orderNumber };
}
