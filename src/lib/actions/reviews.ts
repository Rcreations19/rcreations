'use server';

import { createClient, verifyAdmin } from '../supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleReviewStatus(id: string, is_published: boolean) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('reviews')
    .update({ is_published })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/reviews');
  return { success: true };
}

export async function createReview(formData: FormData) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  const supabase = await createClient();
  
  const author = formData.get('author') as string;
  const business_name = formData.get('business_name') as string;
  const rating = parseInt(formData.get('rating') as string || '5');
  const comment = formData.get('comment') as string;
  const order_type = formData.get('order_type') as string;
  const is_published = formData.get('is_published') === 'on';

  const { error } = await supabase.from('reviews').insert({
    author,
    business_name,
    rating,
    comment,
    order_type,
    is_published,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/reviews');
  return { success: true };
}
