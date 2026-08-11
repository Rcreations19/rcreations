'use server';

import { createClient, verifyAdmin } from '../supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createFrameOption(formData: FormData) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const material = formData.get('material') as string;
  const category = formData.get('category') as string;
  const unitPrice = parseFloat(formData.get('unitPrice') as string || '0');
  const colorHex = formData.get('colorHex') as string || '#000000';
  const colorName = formData.get('colorName') as string;
  const durability = formData.get('durability') as string;
  const description = formData.get('description') as string;
  const isActive = formData.get('isActive') === 'on';

  if (!name || !material || !category) {
    return { error: 'Name, material, and category are required.' };
  }

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
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/frame-options');
  redirect('/admin/frame-options');
}
