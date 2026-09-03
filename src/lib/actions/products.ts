'use server';

import { getAdminClient, createPublicClient } from '../supabase/server';
import { revalidatePath, unstable_cache } from 'next/cache';
import { z } from 'zod';
import { rateLimit } from '../rate-limit';

// -----------------------------------------------------
// GET ACTIONS
// -----------------------------------------------------
export async function getProducts() {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProduct(id: string) {
  if (id === 'new') return null;
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export const getCategoriesForSelect = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    
    if (error) throw new Error(error.message);
    return data;
  },
  ['categories-select-list'],
  { revalidate: 3600, tags: ['categories'] }
);

// -----------------------------------------------------
// MUTATION ACTIONS
// -----------------------------------------------------

const productSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  subtitle: z.string().nullable().optional().transform(val => val || ""),
  slug: z.string().min(1, "Slug is required").max(100),
  category_id: z.string().min(1, "Please select a category").refine(
    (val: string) => /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i.test(val),
    "Please select a valid category from the list"
  ),
  price: z.coerce.number().min(0, "Price must be positive"),
  wholesale_price: z.coerce.number().min(0, "Wholesale price must be positive"),
  moq: z.coerce.number().int().min(1, "MOQ must be at least 1"),
  image_url: z.string().nullable().optional().transform(val => val || ""),
  gallery_images: z.array(z.string().max(1000)).optional().default([]),
  description: z.string().nullable().optional().transform(val => val || ""),
  dimensions: z.string().nullable().optional().transform(val => val || ""),
  material: z.string().nullable().optional().transform(val => val || ""),
  lead_time: z.string().nullable().optional().transform(val => val || ""),
  is_bestseller: z.boolean().default(false),
  is_wholesale_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  specifications: z.any().optional(),
  rating: z.coerce.number().min(0).max(5).optional().default(5.0),
  review_count: z.coerce.number().int().min(0).optional().default(0),
  inventory_count: z.union([z.string(), z.number(), z.null()]).optional().transform(val => (val === "" || val == null) ? null : Number(val)),
  stock_urgency_remaining: z.union([z.string(), z.number(), z.null()]).optional().transform(val => (val === "" || val == null) ? null : Number(val)),
  urgency_timer_title: z.string().nullable().optional().transform(val => val || null),
  urgency_timer_subtitle: z.string().nullable().optional().transform(val => val || null)
});

import { ActionResponse, getSafeErrorMessage } from '../utils/action-response';

export async function saveProduct(formData: FormData): Promise<ActionResponse> {
  try {
    const rl = await rateLimit(20, 60000); // 20 updates per minute max
    if (!rl.success) throw new Error(rl.error || 'Rate limit exceeded');

    const supabase = await getAdminClient();
    const id = formData.get('id') as string;
    const isNew = !id || id === 'new';

    // Parse specific JSON fields before Zod validation
    let galleryImages = [];
    try {
      galleryImages = formData.get('gallery_images') ? JSON.parse(formData.get('gallery_images') as string) : [];
    } catch { galleryImages = []; }

    let specifications = [];
    try {
      specifications = formData.get('specifications') ? JSON.parse(formData.get('specifications') as string) : [];
    } catch { specifications = []; }

    const rawData = {
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      slug: formData.get('slug'),
      category_id: formData.get('category_id'),
      price: formData.get('price'),
      wholesale_price: formData.get('wholesale_price'),
      moq: formData.get('moq'),
      image_url: formData.get('image_url') || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000',
      gallery_images: galleryImages,
      description: formData.get('description'),
      dimensions: formData.get('dimensions'),
      material: formData.get('material'),
      lead_time: formData.get('lead_time'),
      is_bestseller: formData.get('is_bestseller') === 'true',
      is_wholesale_featured: formData.get('is_wholesale_featured') === 'true',
      is_active: formData.get('is_active') === 'true',
      specifications: specifications,
      rating: formData.get('rating'),
      review_count: formData.get('review_count'),
      inventory_count: formData.get('inventory_count'),
      stock_urgency_remaining: formData.get('stock_urgency_remaining'),
      urgency_timer_title: formData.get('urgency_timer_title'),
      urgency_timer_subtitle: formData.get('urgency_timer_subtitle'),
    };

    // Note: category_id UUID format is validated below by productSchema.parse().

    const validatedData = productSchema.parse(rawData);
    const productData = validatedData;

    if (isNew) {
      const { error } = await supabase.from('products').insert(productData as never);
      if (error) throw new Error('Failed to create product.');
    } else {
      const { error } = await supabase.from('products').update(productData as never).eq('id', id);
      if (error) throw new Error('Failed to update product.');
    }

    // Log activity
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('activity_log').insert({
        user_id: user.id,
        action: isNew ? 'created_product' : 'updated_product',
        model_name: 'products',
        record_id: id || 'new',
        created_at: new Date().toISOString(),
      } as never);
    }

    revalidatePath('/admin/products');
    revalidatePath('/products'); // Revalidate storefront catalog
    revalidatePath('/');         // Revalidate homepage (TopSellers section)
    
    return { success: true };
  } catch (error) {
    return { success: false, error: getSafeErrorMessage(error, 'An unexpected error occurred while saving the product.') };
  }
}

export async function deleteProducts(ids: string[]): Promise<ActionResponse> {
  try {
    const rl = await rateLimit(10, 60000); // 10 deletes per minute max
    if (!rl.success) throw new Error(rl.error || 'Rate limit exceeded');

    const supabase = await getAdminClient();
    
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids);

    if (error) throw new Error('Failed to delete products.');

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('activity_log').insert({
        user_id: user.id,
        action: `Deleted ${ids.length} products`,
        model_name: 'products',
        created_at: new Date().toISOString()
      } as never);
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/'); // Revalidate homepage (TopSellers section)
    
    return { success: true };
  } catch (error) {
    return { success: false, error: getSafeErrorMessage(error, 'An unexpected error occurred while deleting products.') };
  }
}
