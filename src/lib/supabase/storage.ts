import { createClient } from './client';
import imageCompression from 'browser-image-compression';
import { validateImageFile, generateUploadPath, resizeImageIfNecessary, type UploadContext } from './upload-utils';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8,
  };
  try {
    return await imageCompression(file, options);
  } catch {
    return file;
  }
}

export async function uploadProductImage(file: File, context: UploadContext = 'product'): Promise<string> {
  const validation = validateImageFile(file, context);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const supabase = createClient();
  const resized = await resizeImageIfNecessary(file);
  const compressedFile = await compressImage(resized);

  const fileExt = file.name.split('.').pop()!;
  const filePath = generateUploadPath(context, fileExt);

  const bucket = context === 'blog' ? 'public' : 'product-images';

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, compressedFile, {
      cacheControl: '31536000',
      upsert: false
    });

  if (error) {
    throw new Error('Failed to upload image.');
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
