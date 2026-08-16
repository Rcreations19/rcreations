'use server';

import { createClient, getAdminClient } from '../supabase/server';
import { revalidatePath } from 'next/cache';

// ========== PUBLIC ACTIONS ==========

export async function getPublicBlogs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getPublicBlogBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ========== ADMIN ACTIONS ==========

export async function getAdminBlogs() {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminBlogById(id: string) {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createBlog(formData: FormData) {
  const supabase = await getAdminClient();
  
  const title = formData.get('title') as string;
  const rawSlug = formData.get('slug') as string;
  const slug = rawSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const summary = formData.get('summary') as string;
  const content = formData.get('content') as string;
  const author = formData.get('author') as string;
  const is_published = formData.get('is_published') === 'true';
  const coverImageFile = formData.get('coverImage') as File | null;
  
  let cover_image_url = null;

  if (coverImageFile && coverImageFile.size > 0) {
    const fileExt = coverImageFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `blogs/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, coverImageFile);
      
    if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);
    
    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);
      
    cover_image_url = publicUrl;
  }

  const { data, error } = await supabase
    .from('blogs')
    .insert([{
      title,
      slug,
      summary,
      content,
      author,
      is_published,
      ...(cover_image_url && { cover_image_url })
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath('/admin/blogs');
  revalidatePath('/blogs');
  return data;
}

export async function updateBlog(id: string, formData: FormData) {
  const supabase = await getAdminClient();
  
  const title = formData.get('title') as string;
  const rawSlug = formData.get('slug') as string;
  const slug = rawSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const summary = formData.get('summary') as string;
  const content = formData.get('content') as string;
  const author = formData.get('author') as string;
  const is_published = formData.get('is_published') === 'true';
  const coverImageFile = formData.get('coverImage') as File | null;
  const existingImageUrl = formData.get('existingImageUrl') as string | null;
  
  let cover_image_url = existingImageUrl;

  if (coverImageFile && coverImageFile.size > 0) {
    const fileExt = coverImageFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `blogs/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, coverImageFile);
      
    if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);
    
    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);
      
    cover_image_url = publicUrl;
  }

  const { data, error } = await supabase
    .from('blogs')
    .update({
      title,
      slug,
      summary,
      content,
      author,
      is_published,
      cover_image_url
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath('/admin/blogs');
  revalidatePath('/blogs');
  revalidatePath(`/blogs/${slug}`);
  return data;
}

export async function deleteBlog(id: string) {
  const supabase = await getAdminClient();
  
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  
  revalidatePath('/admin/blogs');
  revalidatePath('/blogs');
}
