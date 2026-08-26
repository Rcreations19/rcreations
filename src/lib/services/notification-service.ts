import { getServiceRoleClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to create a notification (system-level, uses service role to bypass RLS)
// NOT exported from a 'use server' file to prevent it from becoming a public HTTP endpoint
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
