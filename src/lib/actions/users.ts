'use server';

import { getServiceRoleClient, verifyAdmin } from '../supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleUserActive(id: string, is_active: boolean) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  // Use service role because admin users need to modify other admin/staff profiles
  const supabase = await getServiceRoleClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_active })
    .eq('id', id);

  if (error) {
    return { error: 'Failed to update user.' };
  }

  revalidatePath('/admin/users');
  return { success: true };
}
