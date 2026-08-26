'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Star } from 'lucide-react';
import { updateReview, getReviewById } from '@/lib/actions/reviews';

export default function EditReviewPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState<any>(null);

  useEffect(() => {
    async function loadReview() {
      const result = await getReviewById(id as string);
      if (result?.error) {
        setError(result.error);
      } else if (result?.data) {
        setReview(result.data);
        setRating(result.data.rating);
      }
      setInitialLoading(false);
    }
    loadReview();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append('rating', rating.toString());
    const result = await updateReview(id as string, formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/admin/reviews');
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#10164A]" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-bold mb-4">{error || 'Review not found'}</p>
        <Link href="/admin/reviews" className="text-sm text-[#10164A] hover:underline">
          Return to Reviews
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/reviews" className="p-2 bg-white border border-border rounded-lg text-[#595959] hover:text-[#111111] hover:bg-surface transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">Edit Testimonial</h1>
            <p className="text-sm text-[#595959] mt-1">Update this review or corporate testimonial.</p>
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
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Reviewer Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="author" 
                  required
                  defaultValue={review.author}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Business/Company</label>
                <input 
                  type="text" 
                  name="business_name" 
                  defaultValue={review.business_name || ''}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Order Type <span className="text-red-500">*</span></label>
                <select 
                  name="order_type" 
                  required
                  defaultValue={review.order_type}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                >
                  <option value="Retail Frame">Retail Frame</option>
                  <option value="Corporate Gift">Corporate Gift</option>
                  <option value="Wholesale Bulk">Wholesale Bulk</option>
                  <option value="Google Review">Google Review</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Rating <span className="text-red-500">*</span></label>
                <div className="flex gap-2 pt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star className={`w-8 h-8 transition-colors ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Review Content <span className="text-red-500">*</span></label>
              <textarea 
                name="comment" 
                required
                rows={4}
                defaultValue={review.comment}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow resize-none"
                placeholder="What did they say?"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" name="is_published" defaultChecked={review.is_published} className="sr-only peer" />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Publish Immediately</p>
                  <p className="text-xs text-[#595959]">If checked, this will be visible on the public storefront.</p>
                </div>
              </label>
            </div>

          </div>
          
          <div className="px-6 py-4 bg-surface border-t border-border flex items-center justify-end gap-3">
            <Link href="/admin/reviews" className="px-4 py-2 text-sm font-bold text-[#595959] hover:text-[#111111] transition-colors">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#10164A] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1c246e] transition-colors shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
