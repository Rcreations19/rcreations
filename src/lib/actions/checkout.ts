'use server';

import { createClient, getServiceRoleClient } from '../supabase/server';
import { rateLimit } from '../rate-limit';
import { getPricingConfig } from './pricing';
import { calculateCustomFramePrice } from '../services/pricing-service';

import { z } from 'zod';

const checkoutSchema = z.object({
  name: z.string().min(1).max(100, "Name is too long"),
  email: z.string().email().max(255, "Email is too long"),
  phone: z.string().min(10).max(20, "Phone is too long"),
  address: z.string().min(1).max(500, "Address is too long"),
  city: z.string().min(1).max(100, "City is too long"),
  state: z.string().min(1).max(100, "State is too long"),
  pincode: z.string().min(1).max(20, "Pincode is too long"),
}).strict();

const cartSchema = z.array(z.object({
  id: z.string(),
  quantity: z.number().int().positive(),
  type: z.string().optional(),
  price: z.number().optional(),
  title: z.string().optional(),
  details: z.string().optional(),
  custom_config: z.any().optional()
}).strict()).min(1, "Cart is empty");

import { ActionResponse, getSafeErrorMessage } from '../utils/action-response';

export async function submitOrder(
  rawFormData: { name: string; email: string; phone: string; address: string; city: string; state: string; pincode: string },
  rawCartItems: { id: string; quantity: number; type?: string; price?: number; title?: string; details?: string; custom_config?: Record<string, unknown> }[],
  idempotencyKey: string
): Promise<ActionResponse<{ orderId: string }>> {
  try {
    const rl = await rateLimit(5, 60000); // 5 orders per minute
    if (!rl.success) {
      throw new Error(rl.error || 'Rate limit exceeded');
    }

    // Runtime validation
    const formData = checkoutSchema.parse(rawFormData);
    const cartItems = cartSchema.parse(rawCartItems);

    // Securely validate and recalculate prices for custom configurations.
    // CRIT-1: If pricingConfig is unavailable, hard-fail for custom items
    // to prevent a client-supplied price from passing through unverified.
    const pricingConfig = await getPricingConfig();
    const hasCustomItems = cartItems.some(item => item.type === 'custom');
    if (!pricingConfig && hasCustomItems) {
      throw new Error(
        'Pricing configuration is currently unavailable. Custom frame orders cannot be processed at this time. Please try again shortly.'
      );
    }
    if (pricingConfig) {
      for (const item of cartItems) {
        if (item.type === 'custom' && item.custom_config) {
          const conf = item.custom_config as any;
          if (conf.productType) {
            const baseRate = calculateCustomFramePrice(conf, pricingConfig);

            if (baseRate > 0) {
              let finalBase = baseRate;
              if (conf.glassType && conf.glassType !== 'clear-glass') finalBase += 50;
              if (conf.mountBoard && conf.mountBoard !== 'none') finalBase += 30;
              if (conf.customText) finalBase += 40;
              
              // Force the server calculated price
              item.price = finalBase;
            } else {
              throw new Error(`Invalid custom configuration pricing for item: ${item.title}`);
            }
          }
        }
      }
    }

    // We use the standard client so it respects Row Level Security and standard session contexts.
    // The actual database insertion is handled securely by the `process_checkout` RPC which is set to `SECURITY DEFINER`.
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    const customerId = user?.id || null;

    // Generate a unique order number using cryptographically secure random
    const uuid = crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
    const orderNumber = `ORD-${uuid}`;

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

    const serviceClient = await getServiceRoleClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (serviceClient.rpc as any)('process_checkout', {
      p_idempotency_key: idempotencyKey,
      p_order_data: orderData,
      p_cart_items: cartItems
    });

    if (error) {
      console.error('RPC process_checkout error:', error);
      throw new Error(`Failed to save order. ${error.message || ''}`);
    }

    // Trigger admin notification asynchronously (don't await it to block the response)
    import('../services/notification-service').then(({ createAdminNotification }) => {
      createAdminNotification({
        title: `New Order: ${orderNumber}`,
        message: `${formData.name} placed a new order.`,
        type: 'order',
        link_url: '/admin/orders', // or specific order URL if available
      }).catch(() => {});
    });

    return { success: true, data: { orderId: orderNumber } };
  } catch (error) {
    return { success: false, error: getSafeErrorMessage(error, 'Checkout failed. Please try again.') };
  }
}

