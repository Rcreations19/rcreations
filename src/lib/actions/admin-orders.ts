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
      items:order_items(
        *,
        product:products(image_url)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error('Failed to fetch order details.');

  // Resolve any customer-uploaded photo paths to signed URLs in batch
  if (data?.items) {
    const items = data.items as Record<string, any>[];
    const pathsToSign: string[] = [];
    
    // Collect all paths
    for (const item of items) {
      const storagePath = item.custom_config?.uploadedPhotoUrl;
      if (storagePath && !storagePath.startsWith('http')) {
        pathsToSign.push(storagePath);
      } else if (storagePath) {
        item.custom_config.signedPhotoUrl = storagePath;
      }
    }

    // Batch sign
    if (pathsToSign.length > 0) {
      const { data: signedData } = await supabase.storage
        .from('customer-uploads')
        .createSignedUrls(pathsToSign, 60 * 60); // 1 hour

      if (signedData) {
        // Map back to items
        for (const item of items) {
          const storagePath = item.custom_config?.uploadedPhotoUrl;
          if (storagePath && !storagePath.startsWith('http')) {
            const signed = signedData.find(s => s.path === storagePath);
            if (signed?.signedUrl) {
              item.custom_config.signedPhotoUrl = signed.signedUrl;
            }
          }
        }
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
