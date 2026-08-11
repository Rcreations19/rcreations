'use server';

import { createClient, verifyAdmin } from '../supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCategory(formData: FormData) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const displayOrder = parseInt((formData.get('displayOrder') as string) || '0');
  const isActive = formData.get('isActive') === 'on';

  if (!name || !slug) {
    return { error: 'Name and slug are required.' };
  }

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
    return { error: error.message };
  }

  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}
