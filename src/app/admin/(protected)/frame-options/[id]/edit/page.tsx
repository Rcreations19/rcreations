'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Palette, Image as ImageIcon } from 'lucide-react';
import { updateFrameOption, getFrameOptionById } from '@/lib/actions/frame-options';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';

export default function EditFrameOptionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      loadOption(p.id);
    });
  }, [params]);

  const loadOption = async (optionId: string) => {
    try {
      const result = await getFrameOptionById(optionId);
      if (result.error) throw new Error(result.error);
      setInitialData(result.data);
      if (result.data?.image_url) {
        setPreview(result.data.image_url);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load option.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];
      try {
        const options = {
          maxSizeMB: 0.9,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        const originalName = file.name;
        const compressedFile = await imageCompression(file, options);
        file = new File([compressedFile], originalName, { type: compressedFile.type || file.type });
      } catch (err) {
        console.error('Error compressing image:', err);
      }
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (imageFile) {
      formData.set('imageFile', imageFile);
    }
    const result = await updateFrameOption(id, formData);

    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !initialData) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl max-w-4xl mx-auto mt-6">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/frame-options" className="p-2 bg-white border border-border rounded-lg text-[#595959] hover:text-[#111111] hover:bg-surface transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">Edit Frame Option</h1>
            <p className="text-sm text-[#595959] mt-1">Update details for {initialData?.name}</p>
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
                  defaultValue={initialData?.name}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Category <span className="text-red-500">*</span></label>
                <select 
                  name="category" 
                  required
                  defaultValue={initialData?.category}
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
                  defaultValue={initialData?.material}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Durability <span className="text-red-500">*</span></label>
                <select 
                  name="durability" 
                  required
                  defaultValue={initialData?.durability}
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
                  defaultValue={initialData?.unit_price}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Color Name</label>
                <input 
                  type="text" 
                  name="colorName"
                  defaultValue={initialData?.color_name} 
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Color Hex</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    name="colorHex" 
                    defaultValue={initialData?.color_hex || '#000000'}
                    className="w-12 h-11 p-1 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex-1 relative">
                    <Palette className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      defaultValue={initialData?.color_hex || '#000000'}
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow font-mono"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Image (Optional)</label>
              <div className="flex items-center gap-6">
                {preview ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border bg-surface flex flex-col items-center justify-center text-neutral-400">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-[10px]">No image</span>
                  </div>
                )}
                <div className="flex-1">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#10164A]/10 file:text-[#10164A] hover:file:bg-[#10164A]/20 transition-colors"
                  />
                  <p className="text-xs text-neutral-500 mt-2">Upload a real image to replace the current one.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Description</label>
              <textarea 
                name="description" 
                rows={3}
                defaultValue={initialData?.description}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow resize-none"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" name="isActive" defaultChecked={initialData?.is_active} className="sr-only peer" />
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
              disabled={saving}
              className="bg-[#10164A] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1c246e] transition-colors shadow-sm disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
