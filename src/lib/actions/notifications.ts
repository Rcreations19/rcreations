'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getAdminNotifications() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching admin notifications:', error);
    return [];
  }

  return data;
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }

  revalidatePath('/admin', 'layout');
  return true;
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient();

  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }

  revalidatePath('/admin', 'layout');
  return true;
}

// Helper to create a notification
export async function createAdminNotification(data: {
  title: string;
  message: string;
  type: 'order' | 'inquiry' | 'system';
  link_url?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('admin_notifications')
    .insert([data]);

  if (error) {
    console.error('Error creating notification:', error);
    return false;
  }

  revalidatePath('/admin', 'layout');
  return true;
}
