'use server';

import { createClient } from '../supabase/server';

export async function getPublicProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getPublicProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getPublicRelatedProducts(categoryId: string, excludeProductId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, title, price, image_url, gallery_images, slug')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', excludeProductId)
    .limit(4);

  if (error) throw new Error(error.message);
  return data;
}

export async function getPublicCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  if (error) throw new Error(error.message);
  return data;
}

/** Returns admin-curated bestsellers (is_bestseller = true), ordered by rating.
 *  Falls back to the 8 most recently added active products if none are flagged.
 *  Never throws — returns [] on unrecoverable error.
 */
export async function getBestsellerProducts(limit = 24): Promise<{
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  price: number;
  wholesale_price: number;
  moq: number;
  rating: number;
  review_count: number;
  image_url: string;
  gallery_images: string[];
  is_bestseller: boolean;
  is_curated: boolean; // true = real bestseller, false = fallback
}[]> {
  const supabase = await createClient();

  // 1️⃣ Try the curated bestsellers first (Fetch up to limit)
  const { data: bestsellers, error: err1 } = await supabase
    .from('products')
    .select(
      'id, title, subtitle, slug, price, wholesale_price, moq, rating, review_count, image_url, gallery_images, is_bestseller'
    )
    .eq('is_active', true)
    .eq('is_bestseller', true)
    .order('rating', { ascending: false })
    .limit(limit);

  // If there are ANY curated bestsellers, return ONLY them (do not mix with recent)
  if (!err1 && bestsellers && bestsellers.length > 0) {
    return bestsellers.map(p => ({ ...p, is_curated: true }));
  }

  if (err1) console.error('[getBestsellerProducts] bestseller query failed');

  // 2️⃣ Fallback: if ZERO curated bestsellers exist, fetch recent active products
  // We'll limit the fallback to 8 items so the slider looks good
  const { data: recent, error: err2 } = await supabase
    .from('products')
    .select(
      'id, title, subtitle, slug, price, wholesale_price, moq, rating, review_count, image_url, gallery_images, is_bestseller'
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8); 

  if (err2) {
    console.error('[getBestsellerProducts] fallback query failed');
    return [];
  }

  return (recent ?? []).map(p => ({ ...p, is_curated: false }));
}

