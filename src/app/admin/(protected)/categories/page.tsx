import React from 'react';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Plus, FolderTree, Edit, Trash2 } from 'lucide-react';

export const metadata = {
  title: 'Categories | Admin Dashboard',
};

export default async function CategoriesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">Categories</h1>
          <p className="text-sm text-[#595959] mt-1">Manage product categories and taxonomy.</p>
        </div>
        <Link 
          href="/admin/categories/add" 
          className="bg-[#10164A] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1c246e] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#fcfcfc] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#fcfcfc] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center border border-[#eaeaea]">
                          {cat.image_url ? (
                            <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <FolderTree className="w-4 h-4 text-[#888888]" />
                          )}
                        </div>
                        <span className="font-semibold text-[#111111]">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#595959] font-mono text-xs">{cat.slug}</td>
                    <td className="px-6 py-4 text-[#595959]">{cat.display_order}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        cat.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {cat.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/categories/${cat.id}/edit`} className="p-2 text-[#595959] hover:text-[#0070f3] hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button className="p-2 text-[#595959] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#595959]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderTree className="w-8 h-8 text-[#888888] mb-2" />
                      <p className="font-medium">No categories found</p>
                      <p className="text-xs">Create your first category to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
