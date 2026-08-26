'use server';

import { createClient, getServiceRoleClient } from '@/lib/supabase/server';
import { validateImageFile, generateUploadPath } from '@/lib/supabase/upload-utils';
import { rateLimit } from '../rate-limit';

export async function uploadCustomerPhoto(formData: FormData) {
  try {
    const rl = await rateLimit(10, 60000); // 10 uploads per min max
    if (!rl.success) return { success: false, error: rl.error };

    const supabase = await createClient();

    // 1. Verify Authentication (Crucial security step)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to upload custom photos.' };
    }

    // 2. Extract File
    const file = formData.get('photo') as File;
    if (!file) {
      return { success: false, error: 'No photo provided.' };
    }

    // 3. Enforce our centralized validation (MIME types, 5MB limit)
    const validation = validateImageFile(file, 'product');
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 4. Generate a secure, randomized file path
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = generateUploadPath('product', ext);

    // 5. Upload to Supabase Storage Bucket using admin client to bypass RLS
    // (As per migration: "No client-side INSERT/SELECT policies — all access via server actions")
    const adminSupabase = await getServiceRoleClient();
    const { error: uploadError } = await adminSupabase.storage
      .from('customer-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { success: false, error: 'Failed to upload image to storage.' };
    }

    // Store metadata in Supabase
    const { data: dbRecord, error: dbError } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('customer_uploads' as any)
      .insert({
        user_id: user.id,
        storage_path: filePath,
        original_filename: file.name,
        file_size_bytes: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB Insert error:', dbError);
      // Optional: You could delete the storage file here to prevent orphaned files
      return { success: false, error: 'Failed to save upload record to database.' };
    }

    return { success: true, data: dbRecord };

  } catch (error) {
    console.error('Unexpected upload error:', error);
    return { success: false, error: 'An unexpected error occurred during upload.' };
  }
}
