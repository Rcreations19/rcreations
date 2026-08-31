'use server';

import { createClient, verifyAdmin } from '../supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { rateLimit } from '../rate-limit';
import { validateImageFile, generateUploadPath } from '../supabase/upload-utils';

const frameOptionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  material: z.string().min(1, 'Material is required').max(100),
  category: z.enum(['molding', 'acrylic', 'wood', 'metal']),
  unitPrice: z.coerce.number().min(0, 'Price must be non-negative'),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').default('#000000'),
  colorName: z.string().max(100).optional().default(''),
  durability: z.enum(['Standard', 'Heavy Duty', 'Premium Industrial']).default('Standard'),
  description: z.string().max(2000).optional().default(''),
  isActive: z.boolean().default(false),
});

async function uploadImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const validation = validateImageFile(file, 'product'); // product type for frames
  if (!validation.valid) throw new Error(validation.error);

  const supabase = await createClient();
  const fileExt = file.name.split('.').pop()!;
  const filePath = generateUploadPath('product', fileExt);
  
  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);
    
  if (uploadError) throw new Error('Failed to upload image.');
  
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);
    
  return publicUrl;
}

export async function createFrameOption(formData: FormData) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  const rl = await rateLimit(10, 60000);
  if (!rl.success) return { error: rl.error };
  
  const supabase = await createClient();
  
  const parsed = frameOptionSchema.safeParse({
    name: formData.get('name'),
    material: formData.get('material'),
    category: formData.get('category'),
    unitPrice: formData.get('unitPrice') || '0',
    colorHex: formData.get('colorHex') || '#000000',
    colorName: formData.get('colorName') || undefined,
    durability: formData.get('durability') || undefined,
    description: formData.get('description') || undefined,
    isActive: formData.get('isActive') === 'on',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let imageUrl = null;
  try {
    imageUrl = await uploadImage(formData.get('imageFile') as File | null);
  } catch (err: any) {
    return { error: err.message };
  }

  const { name, material, category, unitPrice, colorHex, colorName, durability, description, isActive } = parsed.data;

  const { error } = await supabase.from('frame_options').insert({
    name,
    material,
    category,
    unit_price: unitPrice,
    color_hex: colorHex,
    color_name: colorName,
    durability,
    description,
    is_active: isActive,
    image_url: imageUrl,
  });

  if (error) {
    return { error: 'Failed to create frame option.' };
  }

  revalidatePath('/admin/frame-options');
  redirect('/admin/frame-options');
}

export async function updateFrameOption(id: string, formData: FormData) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  const rl = await rateLimit(10, 60000);
  if (!rl.success) return { error: rl.error };
  
  const supabase = await createClient();
  
  const parsed = frameOptionSchema.safeParse({
    name: formData.get('name'),
    material: formData.get('material'),
    category: formData.get('category'),
    unitPrice: formData.get('unitPrice') || '0',
    colorHex: formData.get('colorHex') || '#000000',
    colorName: formData.get('colorName') || undefined,
    durability: formData.get('durability') || undefined,
    description: formData.get('description') || undefined,
    isActive: formData.get('isActive') === 'on',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let imageUrl = null;
  try {
    imageUrl = await uploadImage(formData.get('imageFile') as File | null);
  } catch (err: any) {
    return { error: err.message };
  }

  const { name, material, category, unitPrice, colorHex, colorName, durability, description, isActive } = parsed.data;

  const updateData: any = {
    name,
    material,
    category,
    unit_price: unitPrice,
    color_hex: colorHex,
    color_name: colorName,
    durability,
    description,
    is_active: isActive,
  };
  
  if (imageUrl) {
    updateData.image_url = imageUrl;
  }

  const { error } = await supabase.from('frame_options').update(updateData).eq('id', id);

  if (error) {
    return { error: 'Failed to update frame option.' };
  }

  revalidatePath('/admin/frame-options');
  redirect('/admin/frame-options');
}

export async function deleteFrameOption(id: string) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  const rl = await rateLimit(20, 60000);
  if (!rl.success) return { error: rl.error };
  
  const supabase = await createClient();
  
  const { error } = await supabase.from('frame_options').delete().eq('id', id);

  if (error) {
    return { error: 'Failed to delete frame option.' };
  }

  revalidatePath('/admin/frame-options');
  return { success: true };
}

export async function getFrameOptionById(id: string) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('frame_options')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return { error: 'Failed to fetch frame option.' };
  }

  return { data };
}
