'use server';

import { createPublicClient } from '../supabase/server';
import { ActionResponse, getSafeErrorMessage } from '../utils/action-response';

export interface TrackingData {
  order_number: string;
  status: string;
  customer_name: string;
  created_at: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shipping_method: string;
}

export async function trackOrder(orderNumber: string, contact: string): Promise<ActionResponse<TrackingData>> {
  try {
    const supabase = createPublicClient();
    
    // Fetch order if order_number matches and either email or phone matches contact string
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, customer_name, created_at, total, shipping_method, email, phone
      `)
      .eq('order_number', orderNumber.trim())
      .limit(1);

    if (error || !orders || orders.length === 0) {
      return { success: false, error: 'Order not found. Please check your Order ID.' };
    }

    const order = orders[0];

    // Verify contact
    const normalizedContact = contact.trim().toLowerCase();
    const matchesEmail = order.email?.toLowerCase() === normalizedContact;
    
    // Normalize phone by removing spaces, dashes, +91 etc.
    const cleanPhone = (order.phone || '').replace(/\D/g, '').slice(-10);
    const cleanContact = normalizedContact.replace(/\D/g, '').slice(-10);
    const matchesPhone = cleanPhone && cleanContact && cleanPhone === cleanContact;

    if (!matchesEmail && !matchesPhone) {
      return { success: false, error: 'Contact information does not match our records for this order.' };
    }

    // Fetch items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('title, quantity, price')
      .eq('order_id', order.id);

    if (itemsError) {
      throw new Error('Could not retrieve order items.');
    }

    return { 
      success: true, 
      data: {
        order_number: order.order_number,
        status: order.status,
        customer_name: order.customer_name,
        created_at: order.created_at,
        total: order.total,
        shipping_method: order.shipping_method,
        items: items || []
      } 
    };
  } catch (error) {
    return { success: false, error: getSafeErrorMessage(error, 'Failed to track order') };
  }
}
