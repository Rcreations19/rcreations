'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Palette } from 'lucide-react';
import { createFrameOption } from '@/lib/actions/frame-options';

export default function AddFrameOptionPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createFrameOption(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/frame-options" className="p-2 bg-white border border-border rounded-lg text-[#595959] hover:text-[#111111] hover:bg-surface transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">Add Frame Option</h1>
            <p className="text-sm text-[#595959] mt-1">Create a new material or color option for products.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Option Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                  placeholder="e.g. Matte Black Wood"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Category <span className="text-red-500">*</span></label>
                <select 
                  name="category" 
                  required
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                >
                  <option value="molding">Molding</option>
                  <option value="acrylic">Acrylic</option>
                  <option value="wood">Wood</option>
                  <option value="metal">Metal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Material <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="material" 
                  required 
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                  placeholder="e.g. Oak Wood"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Durability <span className="text-red-500">*</span></label>
                <select 
                  name="durability" 
                  required
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                >
                  <option value="Standard">Standard</option>
                  <option value="Heavy Duty">Heavy Duty</option>
                  <option value="Premium Industrial">Premium Industrial</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Base Unit Price (₹) <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  name="unitPrice" 
                  step="0.01"
                  required 
                  min="0"
                  defaultValue="0.00"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Color Name</label>
                <input 
                  type="text" 
                  name="colorName" 
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                  placeholder="e.g. Jet Black"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Color Hex</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    name="colorHex" 
                    defaultValue="#000000"
                    className="w-12 h-11 p-1 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex-1 relative">
                    <Palette className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      defaultValue="#000000"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow font-mono"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Description</label>
              <textarea 
                name="description" 
                rows={3}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow resize-none"
                placeholder="Internal notes or customer-facing details about this option..."
              />
            </div>

            <div className="pt-4 border-t border-border">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" name="isActive" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Active Status</p>
                  <p className="text-xs text-[#595959]">If disabled, this option will not be selectable in configurators.</p>
                </div>
              </label>
            </div>

          </div>
          
          <div className="px-6 py-4 bg-surface border-t border-border flex items-center justify-end gap-3">
            <Link href="/admin/frame-options" className="px-4 py-2 text-sm font-bold text-[#595959] hover:text-[#111111] transition-colors">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#10164A] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1c246e] transition-colors shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Saving...' : 'Save Frame Option'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
