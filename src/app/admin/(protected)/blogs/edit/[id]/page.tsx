'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getAdminBlogById, updateBlog } from '@/lib/actions/blogs';
import { ArrowLeft, Upload, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [blog, setBlog] = useState<any>(null);
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadBlog() {
      try {
        const data = await getAdminBlogById(id as string);
        setBlog(data);
        if (data.cover_image_url) {
          setPreview(data.cover_image_url);
        }
      } catch (err: any) {
        setError('Failed to load blog.');
      } finally {
        setInitialLoading(false);
      }
    }
    if (id) loadBlog();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    if (coverImage) {
      formData.set('coverImage', coverImage);
    }
    if (blog?.cover_image_url && !coverImage) {
      formData.set('existingImageUrl', blog.cover_image_url);
    }
    
    try {
      await updateBlog(id as string, formData);
      router.push('/admin/blogs');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-center text-[#595959]">Loading blog...</div>;
  }

  if (!blog) {
    return <div className="p-8 text-center text-red-500">Blog not found.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <Link href="/admin/blogs" className="inline-flex items-center text-sm text-[#595959] hover:text-[#111] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Blogs
      </Link>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111] tracking-tight">Edit Blog</h1>
        <p className="text-[#595959] text-sm mt-1">Update your existing article.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-border space-y-6">
          
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-[#111] mb-1">Title *</label>
              <input 
                name="title" 
                required 
                defaultValue={blog.title}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0070f3]"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-[#111] mb-1">Slug *</label>
              <input 
                name="slug" 
                required 
                defaultValue={blog.slug}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0070f3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-[#111] mb-1">Author *</label>
              <input 
                name="author" 
                required 
                defaultValue={blog.author}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0070f3]"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-[#111] mb-1">Status</label>
              <select 
                name="is_published" 
                defaultValue={blog.is_published ? "true" : "false"}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0070f3]"
              >
                <option value="false">Draft (Hidden)</option>
                <option value="true">Published (Public)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111] mb-1">Summary *</label>
            <textarea 
              name="summary" 
              required 
              rows={2}
              defaultValue={blog.summary}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0070f3] resize-y"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111] mb-1">Cover Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md relative hover:bg-[#fafafa] transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="mx-auto h-32 object-cover rounded-md shadow-sm" />
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-[#595959]" />
                    <p className="mt-1 text-sm text-[#595959]">Upload a high-quality cover photo</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-medium text-[#111]">Content (Markdown) *</label>
              <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer" className="text-xs text-[#0070f3] hover:underline">Markdown Cheat Sheet</a>
            </div>
            <textarea 
              name="content" 
              required 
              rows={15}
              defaultValue={blog.content}
              className="w-full px-4 py-3 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0070f3] resize-y font-mono bg-[#fafafa]"
            ></textarea>
          </div>

        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/admin/blogs"
            className="px-4 py-2 text-sm font-medium text-[#595959] bg-white border border-border rounded-md hover:bg-[#fafafa] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-[#0070f3] rounded-md hover:bg-[#0060d3] transition-colors shadow-sm disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {loading ? 'Saving...' : 'Update Blog Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
