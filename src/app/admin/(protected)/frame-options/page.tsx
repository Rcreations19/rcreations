import React from 'react';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';

export const metadata = {
  title: 'Frame Options | Admin Dashboard',
};

export default async function FrameOptionsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: options } = await supabase
    .from('frame_options')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">Frame Options</h1>
          <p className="text-sm text-[#595959] mt-1">Manage materials, colors, and pricing for the configurator.</p>
        </div>
        <Link 
          href="/admin/frame-options/add" 
          className="bg-[#10164A] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1c246e] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Option
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#fcfcfc] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Option Name</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Material</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Price (Base)</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {options && options.length > 0 ? (
                options.map((opt) => (
                  <tr key={opt.id} className="hover:bg-[#fcfcfc] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-full border border-black/10 shadow-inner"
                          style={{ backgroundColor: opt.color_hex }}
                        />
                        <div>
                          <span className="font-semibold text-[#111111] block">{opt.name}</span>
                          {opt.color_name && <span className="text-[10px] text-[#595959]">{opt.color_name}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                        {opt.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#595959]">{opt.material}</td>
                    <td className="px-6 py-4 font-mono font-medium">₹{opt.unit_price}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        opt.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {opt.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/frame-options/${opt.id}/edit`} className="p-2 text-[#595959] hover:text-[#0070f3] hover:bg-blue-50 rounded-lg transition-colors">
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
                  <td colSpan={6} className="px-6 py-12 text-center text-[#595959]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Settings className="w-8 h-8 text-[#888888] mb-2" />
                      <p className="font-medium">No frame options found</p>
                      <p className="text-xs">Create configuration options for your products.</p>
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
