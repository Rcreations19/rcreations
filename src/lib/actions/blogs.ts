'use server';

import { createPublicClient, getAdminClient } from '../supabase/server';
import { revalidatePath } from 'next/cache';
import { validateImageFile, generateUploadPath } from '../supabase/upload-utils';
import { rateLimit } from '../rate-limit';
import { ActionResponse, getSafeErrorMessage } from '../utils/action-response';

// ========== PUBLIC ACTIONS ==========

export async function getPublicBlogs() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error('Failed to fetch blogs.');
  return data as any[];
}

export async function getHomepageBlogs() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('blogs')
    // @ts-ignore: show_on_homepage is a new column not yet in types
    .select('id, title, slug, summary, content, cover_image_url, is_published, author, created_at, updated_at, show_on_homepage')
    .eq('is_published', true)
    // @ts-ignore
    .eq('show_on_homepage', true)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) throw new Error('Failed to fetch homepage blogs.');
  return data as any[];
}

export async function getPublicBlogBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) throw new Error('Blog not found.');
  return data;
}

// ========== ADMIN ACTIONS ==========

export async function getAdminBlogs() {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error('Failed to fetch blogs.');
  return data;
}

export async function getAdminBlogById(id: string) {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error('Blog not found.');
  return data;
}

export async function createBlog(formData: FormData): Promise<ActionResponse> {
  try {
    const rl = await rateLimit(10, 60000); // 10 creates per minute max
    if (!rl.success) throw new Error(rl.error);

    const supabase = await getAdminClient();
    
    const title = formData.get('title') as string;
    const rawSlug = formData.get('slug') as string;
    const slug = rawSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const summary = formData.get('summary') as string;
    const content = formData.get('content') as string;
    const author = formData.get('author') as string;
    const is_published = formData.get('is_published') === 'true';
    const show_on_homepage = formData.get('show_on_homepage') === 'true';
    const keywords = formData.get('keywords') as string;
    const coverImageFile = formData.get('coverImage') as File | null;
    
    let cover_image_url = null;

    if (coverImageFile && coverImageFile.size > 0) {
      const validation = validateImageFile(coverImageFile, 'blog');
      if (!validation.valid) throw new Error(validation.error);

      const fileExt = coverImageFile.name.split('.').pop()!;
      const filePath = generateUploadPath('blog', fileExt);
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, coverImageFile);
        
      if (uploadError) throw new Error('Failed to upload cover image.');
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
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
        show_on_homepage,
        keywords,
        ...(cover_image_url && { cover_image_url })
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating blog:', error);
      throw new Error('Failed to create blog.');
    }
    
    revalidatePath('/admin/blogs');
    revalidatePath('/blogs');
    return { success: true };
  } catch (error) {
    console.error('createBlog caught error:', error);
    return { success: false, error: getSafeErrorMessage(error, 'An unexpected error occurred while creating the blog.') };
  }
}

export async function updateBlog(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    const rl = await rateLimit(10, 60000); 
  if (!rl.success) throw new Error(rl.error);

  const supabase = await getAdminClient();
  
  const title = formData.get('title') as string;
  const rawSlug = formData.get('slug') as string;
  const slug = rawSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const summary = formData.get('summary') as string;
  const content = formData.get('content') as string;
  const author = formData.get('author') as string;
  const is_published = formData.get('is_published') === 'true';
  const show_on_homepage = formData.get('show_on_homepage') === 'true';
  const keywords = formData.get('keywords') as string;
  const coverImageFile = formData.get('coverImage') as File | null;
  const existingImageUrl = formData.get('existingImageUrl') as string | null;
  
  let cover_image_url = existingImageUrl;

  if (coverImageFile && coverImageFile.size > 0) {
    const validation = validateImageFile(coverImageFile, 'blog');
    if (!validation.valid) throw new Error(validation.error);

    const fileExt = coverImageFile.name.split('.').pop()!;
    const filePath = generateUploadPath('blog', fileExt);
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, coverImageFile);
      
    if (uploadError) {
      // MED-6: Log internally; do NOT expose uploadError.message to the client
      // (Supabase storage errors can reveal bucket names and policy details)
      console.error('Upload Error Details:', uploadError);
      throw new Error('Failed to upload cover image. Please try again.');
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
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
      keywords,
      show_on_homepage,
      cover_image_url
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase error updating blog:', error);
    throw new Error('Failed to update blog.');
  }
  
  revalidatePath('/admin/blogs');
  revalidatePath('/blogs');
  revalidatePath(`/blogs/${slug}`);
  return { success: true };
  } catch (error) {
    console.error('updateBlog caught error:', error);
    return { success: false, error: getSafeErrorMessage(error, 'An unexpected error occurred while updating the blog.') };
  }
}

export async function deleteBlog(id: string): Promise<ActionResponse> {
  try {
    const rl = await rateLimit(5, 60000); // 5 deletes per minute max
    if (!rl.success) throw new Error(rl.error);

    const supabase = await getAdminClient();
    
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting blog:', error);
      throw new Error('Failed to delete blog.');
    }
    
    revalidatePath('/admin/blogs');
    revalidatePath('/blogs');
    return { success: true };
  } catch (error) {
    console.error('deleteBlog caught error:', error);
    return { success: false, error: getSafeErrorMessage(error, 'An unexpected error occurred while deleting the blog.') };
  }
}
