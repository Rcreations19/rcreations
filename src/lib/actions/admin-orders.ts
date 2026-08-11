'use server';

import { getAdminClient } from '../supabase/server';
import { revalidatePath } from 'next/cache';
export async function getOrders() {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
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

  if (error) throw new Error(error.message);
  return data;
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await getAdminClient();
  
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
}
