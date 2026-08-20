'use server';

import { createClient, getServiceRoleClient, verifyAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getAdminNotifications() {
  try { await verifyAdmin(); } catch { return []; }
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching admin notifications');
    return [];
  }

  return data;
}

export async function markNotificationAsRead(id: string) {
  try { await verifyAdmin(); } catch { return false; }
  const supabase = await createClient();

  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) {
    console.error('Error marking notification as read');
    return false;
  }

  revalidatePath('/admin', 'layout');
  return true;
}

export async function markAllNotificationsAsRead() {
  try { await verifyAdmin(); } catch { return false; }
  const supabase = await createClient();

  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read');
    return false;
  }

  revalidatePath('/admin', 'layout');
  return true;
}

// Helper to create a notification (system-level, uses service role to bypass RLS)
export async function createAdminNotification(data: {
  title: string;
  message: string;
  type: 'order' | 'inquiry' | 'system';
  link_url?: string;
}) {
  const supabase = await getServiceRoleClient();

  const { error } = await supabase
    .from('admin_notifications')
    .insert([data]);

  if (error) {
    console.error('Error creating notification');
    return false;
  }

  revalidatePath('/admin', 'layout');
  return true;
}
