'use server';

import { getAdminClient } from '../supabase/server';
import { revalidatePath } from 'next/cache';

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
  return data;
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
export async function saveProduct(formData: FormData) {
  const supabase = await getAdminClient();
  const id = formData.get('id') as string;
  const isNew = !id || id === 'new';

  const productData = {
    title: formData.get('title') as string,
    subtitle: formData.get('subtitle') as string,
    slug: formData.get('slug') as string,
    category_id: formData.get('category_id') as string,
    price: Number(formData.get('price')),
    wholesale_price: Number(formData.get('wholesale_price')),
    moq: Number(formData.get('moq')),
    image_url: formData.get('image_url') as string || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000',
    gallery_images: formData.get('gallery_images') ? JSON.parse(formData.get('gallery_images') as string) : [],
    description: formData.get('description') as string,
    dimensions: formData.get('dimensions') as string,
    material: formData.get('material') as string,
    lead_time: formData.get('lead_time') as string,
    is_bestseller: formData.get('is_bestseller') === 'true',
    is_wholesale_featured: formData.get('is_wholesale_featured') === 'true',
    is_active: formData.get('is_active') === 'true',
    // In a real app, specifications would be parsed from a dynamic field group
    specifications: JSON.parse((formData.get('specifications') as string) || '[]'),
  };

  if (isNew) {
    const { error } = await supabase.from('products').insert(productData as never);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('products').update(productData as never).eq('id', id);
    if (error) throw new Error(error.message);
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
  revalidatePath('/products'); // Revalidate storefront
}

export async function deleteProducts(ids: string[]) {
  const supabase = await getAdminClient();
  
  const { error } = await supabase
    .from('products')
    .delete()
    .in('id', ids);

  if (error) throw new Error(error.message);

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
}
