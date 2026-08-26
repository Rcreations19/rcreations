'use server';

import { getAdminClient } from '../supabase/server';
import { revalidatePath } from 'next/cache';
import { rateLimit } from '../rate-limit';
export async function getOrders() {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error('Failed to fetch orders.');
  return data;
}

export async function getOrderById(id: string) {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error('Failed to fetch order details.');

  // Resolve any customer-uploaded photo paths to signed URLs
  if (data?.items) {
    for (const item of data.items as any[]) {
      const storagePath = item.custom_config?.uploadedPhotoUrl;
      if (storagePath && !storagePath.startsWith('http')) {
        const { data: signedData } = await supabase.storage
          .from('customer-uploads')
          .createSignedUrl(storagePath, 60 * 60); // 1 hour
        if (signedData?.signedUrl) {
          item.custom_config.signedPhotoUrl = signedData.signedUrl;
        }
      } else if (storagePath) {
        // Already a full URL (legacy or fallback)
        item.custom_config.signedPhotoUrl = storagePath;
      }
    }
  }

  return data;
}

export async function updateOrderStatus(id: string, status: string) {
  const rl = await rateLimit(20, 60000); // 20 updates per min
  if (!rl.success) throw new Error(rl.error);

  const supabase = await getAdminClient();
  
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error('Failed to update order status.');

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
}
