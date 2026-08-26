'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/admin/DataTable';
import { getAdminBlogs, deleteBlog } from '@/lib/actions/blogs';
import { Check, X, FileText } from 'lucide-react';

export default function BlogsListPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const fetchBlogs = async () => {
    try {
      const data = await getAdminBlogs();
      setBlogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (ids: string[]) => {
    if (confirm(`Are you sure you want to delete ${ids.length} blogs?`)) {
      for (const id of ids) {
        await deleteBlog(id);
      }
      await fetchBlogs();
    }
  };

  const columns = [
    {
      header: 'Title',
      cell: (item: any) => (
        <Link href={`/admin/blogs/edit/${item.id}`} className="font-bold text-[#10164A] hover:text-accent transition-colors">
          {item.title}
        </Link>
      )
    },
    {
      header: 'Slug',
      cell: (item: any) => <span className="font-mono text-neutral-600 text-sm">{item.slug}</span>
    },
    {
      header: 'Author',
      cell: (item: any) => item.author
    },
    {
      header: 'Status',
      cell: (item: any) => item.is_published 
        ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800"><Check className="w-3 h-3 mr-1" /> Published</span>
        : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800">Draft</span>
    },
    {
      header: 'Date',
      cell: (item: any) => new Date(item.created_at).toLocaleDateString()
    }
  ];

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111] tracking-tight">Blogs</h1>
          <p className="text-[#595959] text-sm mt-1">Manage your blog articles and publications.</p>
        </div>
        <Link 
          href="/admin/blogs/add"
          className="bg-[#0070f3] hover:bg-[#0060d3] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          Write New Blog
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-[#fafafa]">
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-1.5 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0070f3]"
          />
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-[#595959]">Loading blogs...</div>
        ) : (
          <DataTable 
            data={filteredBlogs}
            columns={columns}
            actions={{ onBulkDelete: handleDelete }}
          />
        )}
      </div>
    </div>
  );
}
