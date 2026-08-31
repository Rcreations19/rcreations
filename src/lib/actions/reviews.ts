'use server';

import { createClient, verifyAdmin } from '../supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { rateLimit } from '../rate-limit';

const reviewSchema = z.object({
  author: z.string().min(1, 'Author is required').max(200),
  business_name: z.string().max(200).optional().default(''),
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(1, 'Comment is required').max(2000),
  order_type: z.enum(['Wholesale Bulk', 'Corporate Gift', 'Retail Frame', 'Google Review']).default('Retail Frame'),
  is_published: z.boolean().default(false),
});

export async function toggleReviewStatus(id: string, is_published: boolean) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  const rl = await rateLimit(20, 60000);
  if (!rl.success) return { error: rl.error };

  const supabase = await createClient();
  
  const { error } = await supabase
    .from('reviews')
    .update({ is_published })
    .eq('id', id);

  if (error) {
    return { error: 'Failed to update review status.' };
  }

  revalidatePath('/admin/reviews');
  return { success: true };
}

export async function createReview(formData: FormData) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  const rl = await rateLimit(10, 60000);
  if (!rl.success) return { error: rl.error };

  const supabase = await createClient();
  
  const parsed = reviewSchema.safeParse({
    author: formData.get('author'),
    business_name: formData.get('business_name') || undefined,
    rating: formData.get('rating') || '5',
    comment: formData.get('comment'),
    order_type: formData.get('order_type') || undefined,
    is_published: formData.get('is_published') === 'on',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { author, business_name, rating, comment, order_type, is_published } = parsed.data;

  const { error } = await supabase.from('reviews').insert({
    author,
    business_name,
    rating,
    comment,
    order_type,
    is_published,
  });

  if (error) {
    return { error: 'Failed to create review.' };
  }

  revalidatePath('/admin/reviews');
  return { success: true };
}

export async function getReviewById(id: string) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return { error: 'Failed to fetch review.' };
  }

  return { data };
}

export async function updateReview(id: string, formData: FormData) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  const rl = await rateLimit(10, 60000);
  if (!rl.success) return { error: rl.error };

  const supabase = await createClient();
  
  const parsed = reviewSchema.safeParse({
    author: formData.get('author'),
    business_name: formData.get('business_name') || undefined,
    rating: formData.get('rating') || '5',
    comment: formData.get('comment'),
    order_type: formData.get('order_type') || undefined,
    is_published: formData.get('is_published') === 'on',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { author, business_name, rating, comment, order_type, is_published } = parsed.data;

  const { error } = await supabase
    .from('reviews')
    .update({
      author,
      business_name,
      rating,
      comment,
      order_type,
      is_published,
    })
    .eq('id', id);

  if (error) {
    return { error: 'Failed to update review.' };
  }

  revalidatePath('/admin/reviews');
  return { success: true };
}

export async function deleteReview(id: string) {
  try { await verifyAdmin(); } catch (e) { return { error: 'Unauthorized' }; }
  const rl = await rateLimit(20, 60000);
  if (!rl.success) return { error: rl.error };
  
  const supabase = await createClient();
  
  const { error } = await supabase.from('reviews').delete().eq('id', id);

  if (error) {
    return { error: 'Failed to delete review.' };
  }

  revalidatePath('/admin/reviews');
  return { success: true };
}
