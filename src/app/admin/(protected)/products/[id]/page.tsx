'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProduct, getCategoriesForSelect, saveProduct } from '@/lib/actions/products';
import { ChevronRight, Save, Trash2, Plus, GripVertical } from 'lucide-react';
import { MultiImageUploader } from '@/components/admin/MultiImageUploader';
import Link from 'next/link';

export default function ProductChangePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === 'new';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  
  const [specs, setSpecs] = useState<{label: string, value: string}[]>([]);
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>([]);

  // Form State
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    slug: '',
    category_id: '',
    price: '',
    wholesale_price: '',
    moq: '1',
    image_url: '',
    description: '',
    dimensions: '',
    material: '',
    lead_time: '',
    gallery_images: [] as string[],
    is_bestseller: false,
    is_wholesale_featured: false,
    is_active: true,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const cats = await getCategoriesForSelect();
        setCategories(cats as {id: string, name: string}[]);

        if (!isNew) {
          const prod = await getProduct(resolvedParams.id) as any;
          if (prod) {
            setForm({
              title: String(prod.title || ''),
              subtitle: String(prod.subtitle || ''),
              slug: String(prod.slug || ''),
              category_id: String(prod.category_id || ''),
              price: String(prod.price || ''),
              wholesale_price: String(prod.wholesale_price || ''),
              moq: String(prod.moq || '1'),
              image_url: String(prod.image_url || ''),
              gallery_images: Array.isArray(prod.gallery_images) 
                ? (prod.gallery_images as string[]) 
                : (prod.image_url ? [String(prod.image_url)] : []),
              description: String(prod.description || ''),
              dimensions: String(prod.dimensions || ''),
              material: String(prod.material || ''),
              lead_time: String(prod.lead_time || ''),
              is_bestseller: Boolean(prod.is_bestseller),
              is_wholesale_featured: Boolean(prod.is_wholesale_featured),
              is_active: Boolean(prod.is_active),
            });
            setSlugManuallyEdited(true); // Don't auto-update slug on edit

            let parsedSpecs = [];
            let parsedFaqs = [];
            if (prod.specifications) {
              try {
                const parsed = typeof prod.specifications === 'string' ? JSON.parse(prod.specifications) : prod.specifications;
                if (Array.isArray(parsed)) {
                  parsedSpecs = parsed;
                } else if (parsed && typeof parsed === 'object') {
                  parsedSpecs = parsed.specs || [];
                  parsedFaqs = parsed.faqs || [];
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
            setSpecs(parsedSpecs);
            setFaqs(parsedFaqs);
          }
        } else {
          // Set default category if exists
          if (cats.length > 0) setForm(prev => ({ ...prev, category_id: String((cats as any[])[0].id) }));
        }
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('id', resolvedParams.id);
      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'gallery_images') {
          formData.append(key, value.toString());
        }
      });

      // Extract primary image from gallery_images
      if (form.gallery_images.length > 0) {
        formData.set('image_url', form.gallery_images[0]);
      }
      formData.append('gallery_images', JSON.stringify(form.gallery_images));
      
      // Combine and append specifications and faqs
      formData.append('specifications', JSON.stringify({ specs, faqs }));

      await saveProduct(formData);
      router.push('/admin/products');
    } catch (err: unknown) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'slug') setSlugManuallyEdited(true);

    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'title' && isNew && !slugManuallyEdited) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return next;
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  if (loading) return <div className="p-8 text-neutral-500">Loading...</div>;

  return (
    <div className="max-w-5xl">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 mb-6">
        <Link href="/admin" className="hover:text-[#10164A]">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/admin/products" className="hover:text-[#10164A]">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#10164A]">{isNew ? 'Add product' : form.title}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#10164A]">{isNew ? 'Add product' : 'Change product'}</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fieldset: General */}
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#10164A] px-4 py-2 border-b border-neutral-200">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">General Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Title *</label>
                <input required name="title" value={form.title} onChange={handleTextChange} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-[#10164A] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Slug *</label>
                <input required name="slug" value={form.slug} onChange={handleTextChange} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-[#10164A] focus:outline-none font-mono text-sm" />
                <p className="text-[10px] text-neutral-500 mt-1">Used in the URL. Must be unique.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Subtitle</label>
              <input name="subtitle" value={form.subtitle} onChange={handleTextChange} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-[#10164A] focus:outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Category *</label>
                <select required name="category_id" value={form.category_id} onChange={handleTextChange} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-[#10164A] focus:outline-none">
                  <option value="" disabled>Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Description</label>
              <textarea name="description" rows={4} value={form.description} onChange={handleTextChange} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-[#10164A] focus:outline-none"></textarea>
            </div>
          </div>
        </div>

        {/* Fieldset: Product Images */}
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#10164A] px-4 py-2 border-b border-neutral-200">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Product Images</h2>
          </div>
          <div className="p-6">
            <MultiImageUploader 
              images={form.gallery_images}
              onChange={(images) => setForm(prev => ({ ...prev, gallery_images: images }))}
            />
          </div>
        </div>

        {/* Fieldset: Pricing & Wholesale */}
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#10164A] px-4 py-2 border-b border-neutral-200">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Pricing & Wholesale</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Retail Price (₹) *</label>
                <input required type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleTextChange} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-[#10164A] focus:outline-none font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Wholesale Price (₹) *</label>
                <input required type="number" min="0" step="0.01" name="wholesale_price" value={form.wholesale_price} onChange={handleTextChange} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-[#10164A] focus:outline-none font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Minimum Order Qty (MOQ) *</label>
                <input required type="number" min="1" name="moq" value={form.moq} onChange={handleTextChange} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-[#10164A] focus:outline-none font-mono" />
              </div>
            </div>
          </div>
        </div>

        {/* Fieldset: Technical Specifications */}
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#10164A] px-4 py-2 border-b border-neutral-200 flex justify-between items-center">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Technical Specifications</h2>
            <button type="button" onClick={() => setSpecs([...specs, {label: '', value: ''}])} className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors">
              <Plus className="w-3 h-3" /> Add Spec
            </button>
          </div>
          <div className="p-6">
            {specs.length === 0 ? (
              <p className="text-sm text-neutral-500 italic">No specifications added yet.</p>
            ) : (
              <div className="space-y-3">
                {specs.map((spec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-2 text-neutral-400 cursor-move"><GripVertical className="w-4 h-4" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                      <input placeholder="Label (e.g., Material)" value={spec.label} onChange={e => {
                        const newSpecs = [...specs];
                        newSpecs[i].label = e.target.value;
                        setSpecs(newSpecs);
                      }} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-[#10164A] focus:outline-none text-sm" />
                      <input placeholder="Value (e.g., Solid Pine Wood)" value={spec.value} onChange={e => {
                        const newSpecs = [...specs];
                        newSpecs[i].value = e.target.value;
                        setSpecs(newSpecs);
                      }} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-[#10164A] focus:outline-none text-sm" />
                    </div>
                    <button type="button" onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))} className="mt-2 text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fieldset: Frequently Asked Questions */}
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#10164A] px-4 py-2 border-b border-neutral-200 flex justify-between items-center">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Frequently Asked Questions</h2>
            <button type="button" onClick={() => setFaqs([...faqs, {question: '', answer: ''}])} className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors">
              <Plus className="w-3 h-3" /> Add FAQ
            </button>
          </div>
          <div className="p-6">
            {faqs.length === 0 ? (
              <p className="text-sm text-neutral-500 italic">No FAQs added yet.</p>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="flex items-start gap-3 bg-neutral-50 p-4 rounded border border-neutral-200">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Question</label>
                        <input placeholder="e.g., Does this frame include glass?" value={faq.question} onChange={e => {
                          const newFaqs = [...faqs];
                          newFaqs[i].question = e.target.value;
                          setFaqs(newFaqs);
                        }} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-[#10164A] focus:outline-none text-sm font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Answer</label>
                        <textarea placeholder="e.g., Yes, all frames come with clear acrylic glass..." value={faq.answer} onChange={e => {
                          const newFaqs = [...faqs];
                          newFaqs[i].answer = e.target.value;
                          setFaqs(newFaqs);
                        }} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-[#10164A] focus:outline-none text-sm" rows={2} />
                      </div>
                    </div>
                    <button type="button" onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))} className="mt-6 text-red-500 hover:text-red-700 p-2 bg-white rounded shadow-sm border border-neutral-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fieldset: Status & Visibility */}
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#10164A] px-4 py-2 border-b border-neutral-200">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Status & Visibility</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleCheckboxChange} className="w-4 h-4 rounded border-neutral-300 text-[#10164A] focus:ring-[#10164A]" />
                <span className="text-sm font-bold text-neutral-800">Is Active</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="is_bestseller" checked={form.is_bestseller} onChange={handleCheckboxChange} className="w-4 h-4 rounded border-neutral-300 text-[#10164A] focus:ring-[#10164A]" />
                <span className="text-sm font-bold text-neutral-800">Bestseller (shows badge)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="is_wholesale_featured" checked={form.is_wholesale_featured} onChange={handleCheckboxChange} className="w-4 h-4 rounded border-neutral-300 text-[#10164A] focus:ring-[#10164A]" />
                <span className="text-sm font-bold text-neutral-800">Featured in Wholesale Catalog</span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions (Django-style sticky bar) */}
        <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4 flex items-center justify-between shadow-sm sticky bottom-4 z-10">
          {!isNew ? (
            <button type="button" className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded hover:bg-red-700 transition-colors flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          ) : <div></div>}
          
          <div className="flex items-center gap-3">
            <Link href="/admin/products" className="px-4 py-2 text-neutral-600 text-sm font-bold rounded hover:bg-neutral-200 transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-[#10164A] text-white text-sm font-bold rounded hover:bg-[#1c246e] transition-colors flex items-center gap-2 disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
