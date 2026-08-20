'use server';

import { getAdminClient } from '../supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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

export async function getCategoriesForSelect() {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');
  
  if (error) throw new Error(error.message);
  return data;
}

// -----------------------------------------------------
// MUTATION ACTIONS
// -----------------------------------------------------

const productSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  subtitle: z.string().nullable().optional().transform(val => val || ""),
  slug: z.string().min(1, "Slug is required").max(100),
  category_id: z.string().uuid("Invalid category ID"),
  price: z.coerce.number().min(0, "Price must be positive"),
  wholesale_price: z.coerce.number().min(0, "Wholesale price must be positive"),
  moq: z.coerce.number().int().min(1, "MOQ must be at least 1"),
  image_url: z.string().nullable().optional().transform(val => val || ""),
  gallery_images: z.array(z.string().url().max(1000)).optional().default([]),
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
  stock_urgency_remaining: z.union([z.string(), z.number(), z.null()]).optional().transform(val => (val === "" || val == null) ? null : Number(val)),
  urgency_timer_title: z.string().nullable().optional().transform(val => val || null),
  urgency_timer_subtitle: z.string().nullable().optional().transform(val => val || null)
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProductResult = { success: true; error?: undefined; details?: undefined } | { error: string; details?: any; success?: undefined };

export async function saveProduct(formData: FormData): Promise<ProductResult> {
  try {
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
      stock_urgency_remaining: formData.get('stock_urgency_remaining'),
      urgency_timer_title: formData.get('urgency_timer_title'),
      urgency_timer_subtitle: formData.get('urgency_timer_subtitle'),
    };

    const validatedData = productSchema.safeParse(rawData);

    if (!validatedData.success) {
      return { error: "Validation failed", details: validatedData.error.flatten() };
    }

    const productData = validatedData.data;

    if (isNew) {
      const { error } = await supabase.from('products').insert(productData as never);
      if (error) return { error: 'Failed to create product.' };
    } else {
      const { error } = await supabase.from('products').update(productData as never).eq('id', id);
      if (error) return { error: 'Failed to update product.' };
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
  } catch {
    return { error: 'An unexpected error occurred.' };
  }
}

export async function deleteProducts(ids: string[]): Promise<ProductResult> {
  try {
    const supabase = await getAdminClient();
    
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids);

    if (error) return { error: 'Failed to delete products.' };

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
  } catch {
    return { error: 'An unexpected error occurred.' };
  }
}
