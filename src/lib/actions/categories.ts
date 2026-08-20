'use server';

import { createClient, verifyAdmin } from '../supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(2000).optional().default(''),
  imageUrl: z.string().url().max(1000).optional().default(''),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(false),
});

export async function createCategory(formData: FormData) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  const supabase = await createClient();
  
  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
    imageUrl: formData.get('imageUrl') || undefined,
    displayOrder: formData.get('displayOrder') || '0',
    isActive: formData.get('isActive') === 'on',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, slug, description, imageUrl, displayOrder, isActive } = parsed.data;

  const { error } = await supabase.from('categories').insert({
    name,
    slug,
    description,
    image_url: imageUrl,
    display_order: displayOrder,
    is_active: isActive,
  });

  if (error) {
    if (error.code === '23505') {
      return { error: 'A category with this slug already exists.' };
    }
    return { error: 'Failed to create category.' };
  }

  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}
