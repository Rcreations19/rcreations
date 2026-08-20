'use server';

import { createClient, verifyAdmin } from '../supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSiteSettings(formData: FormData) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  const supabase = await createClient();
  
  // Update multiple keys at once
  const keys = ['contact_email', 'contact_phone', 'store_address', 'announcement_banner'];
  
  for (const key of keys) {
    const valueStr = formData.get(key) as string;
    if (valueStr !== null) {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          key, 
          value: { text: valueStr },
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
        
      if (error) {
        console.error(`Failed to update setting`);
        return { error: 'Failed to update setting.' };
      }
    }
  }

  revalidatePath('/admin/site-settings');
  return { success: true };
}
