'use server';

import { createClient, verifyAdmin } from '../supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

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

export async function createFrameOption(formData: FormData) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
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
  });

  if (error) {
    return { error: 'Failed to create frame option.' };
  }

  revalidatePath('/admin/frame-options');
  redirect('/admin/frame-options');
}
