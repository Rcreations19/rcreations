'use server';

import { createClient, verifyAdmin } from '@/lib/supabase/server';

export interface UploadRecord {
  id: string;
  user_id: string | null;
  session_id: string | null;
  storage_path: string;
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  width_px: number | null;
  height_px: number | null;
  created_at: string;
  signedUrl?: string | null;
}

export async function getCustomerUploads(): Promise<UploadRecord[]> {
  try {
    const supabase = await createClient();

    // Ensure the user is an admin
    try {
      await verifyAdmin();
    } catch (e) {
      console.error('Unauthorized access to getCustomerUploads:', e);
      return [];
    }
    
    // Using service role to bypass RLS if admin check implies they can see all
    // Wait, the client returned by createClient() uses the user's JWT. 
    // Admin RLS bypass is typically handled via roles in Supabase.
    // We will attempt to fetch all records. If RLS blocks it, no records will return.
    // Since this is for the admin panel, the admin should have access.
    
    const { data, error: fetchError } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('customer_uploads' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError || !data) {
      console.error('Error fetching customer uploads:', fetchError);
      return [];
    }

    const uploads = data as unknown as UploadRecord[];

    // Generate temporary signed URLs (valid for 1 hour) for the images
    const paths = uploads.map(u => u.storage_path);
    
    const signedUrlMap: Record<string, string> = {};
    if (paths.length > 0) {
      const { data: signedUrls, error: signError } = await supabase
        .storage
        .from('customer-uploads')
        .createSignedUrls(paths, 3600);
        
      if (!signError && signedUrls) {
        signedUrls.forEach((file) => {
          if (!file.error && file.signedUrl) {
            signedUrlMap[file.path || ''] = file.signedUrl;
          }
        });
      } else {
        console.error('Error generating signed URLs:', signError);
      }
    }

    // Attach signed URL to each record
    return uploads.map(u => ({
      ...u,
      signedUrl: signedUrlMap[u.storage_path] || null
    }));

  } catch (error) {
    console.error('Unexpected error in getCustomerUploads:', error);
    return [];
  }
}
