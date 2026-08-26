'use server';

import { createPublicClient } from '../supabase/server';
import { unstable_cache } from 'next/cache';

const _getPublicProducts = async () => {
  const supabase = createPublicClient();
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

export const getPublicProducts = unstable_cache(_getPublicProducts, ['public-products'], { revalidate: 3600, tags: ['products'] });

const _getPublicProductBySlug = async (slug: string) => {
  const supabase = createPublicClient();
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

export const getPublicProductBySlug = unstable_cache(_getPublicProductBySlug, ['public-product-slug'], { revalidate: 3600, tags: ['products'] });

const _getPublicRelatedProducts = async (product: any, limit = 4) => {
  const supabase = createPublicClient();
  
  // Fetch candidate products (active, not the same product)
  // We fetch a larger pool (e.g., 20) from the same category or material to score them
  const { data: candidates, error } = await supabase
    .from('products')
    .select('id, title, price, wholesale_price, moq, image_url, gallery_images, slug, category_id, material, is_bestseller, rating')
    .eq('is_active', true)
    .neq('id', product.id)
    .or(`category_id.eq.${product.category_id},material.ilike.%${(product.material || '').split(' ')[0]}%`)
    .limit(30);

  if (error) {
    console.error('[getPublicRelatedProducts] Failed to fetch related candidates', error);
    return [];
  }
  
  if (!candidates || candidates.length === 0) return [];

  // Score each candidate
  const scoredCandidates = candidates.map(candidate => {
    let score = 0;
    
    // +20 points for same category
    if (candidate.category_id === product.category_id) score += 20;
    
    // +15 points for same material
    if (product.material && candidate.material && candidate.material.toLowerCase() === product.material.toLowerCase()) {
      score += 15;
    }
    
    // +10 points for similar price (within 25%)
    const priceDiff = Math.abs(candidate.price - product.price);
    const percentDiff = priceDiff / product.price;
    if (percentDiff <= 0.25) {
      score += 10;
    }
    
    // +5 points for bestsellers
    if (candidate.is_bestseller) {
      score += 5;
    }
    
    // + Rating bonus (up to 5 pts)
    if (candidate.rating) {
      score += (candidate.rating / 5) * 5;
    }
    
    return { ...candidate, _score: score };
  });
  
  // Sort by score descending and take the top N
  scoredCandidates.sort((a, b) => b._score - a._score);
  
  return scoredCandidates.slice(0, limit);
}

export const getPublicRelatedProducts = unstable_cache(_getPublicRelatedProducts, ['public-related-products'], { revalidate: 3600, tags: ['products'] });

const _getPublicCategories = async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  if (error) throw new Error(error.message);
  return data;
}

export const getPublicCategories = unstable_cache(_getPublicCategories, ['public-categories'], { revalidate: 3600, tags: ['categories'] });

/** Returns admin-curated bestsellers (is_bestseller = true), ordered by rating.
 *  Never throws — returns [] on unrecoverable error.
 */
const _getBestsellerProducts = async (limit = 24): Promise<{
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
}[]> => {
  const supabase = createPublicClient();

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

  if (!err1 && bestsellers && bestsellers.length > 0) {
    return bestsellers.map(p => ({ ...p, is_curated: true }));
  }

  if (err1) console.error('[getBestsellerProducts] bestseller query failed');

  return [];
}

export const getBestsellerProducts = unstable_cache(_getBestsellerProducts, ['bestseller-products'], { revalidate: 3600, tags: ['products'] });
