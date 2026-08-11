import React from 'react';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { MessageSquareQuote, Eye, EyeOff, Plus, Star } from 'lucide-react';
import { toggleReviewStatus } from '@/lib/actions/reviews';

export const metadata = {
  title: 'Reviews & Testimonials | Admin Dashboard',
};

export default async function ReviewsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, products(title)')
    .order('created_at', { ascending: false });

  const handleToggle = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    const isPublished = formData.get('is_published') === 'true';
    await toggleReviewStatus(id, !isPublished);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">Reviews</h1>
          <p className="text-sm text-[#595959] mt-1">Moderate customer reviews and corporate testimonials.</p>
        </div>
        <Link 
          href="/admin/reviews/add" 
          className="bg-[#10164A] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1c246e] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888] ml-2 border-l border-neutral-200 pl-3">
                    {review.order_type}
                  </span>
                </div>
                
                <p className="text-[#111111] text-sm italic mb-4">"{review.comment}"</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#111111]">{review.author}</p>
                    {review.business_name && <p className="text-xs text-[#595959]">{review.business_name}</p>}
                  </div>
                  {review.products?.title && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Product</p>
                      <p className="text-xs text-[#111111] truncate max-w-[200px]">{review.products.title}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-[#fcfcfc] border-t md:border-t-0 md:border-l border-[#eaeaea] p-6 flex md:flex-col items-center justify-center gap-4 md:w-48">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-2">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    review.is_published ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {review.is_published ? 'Published' : 'Hidden'}
                  </span>
                </div>
                
                <form action={handleToggle}>
                  <input type="hidden" name="id" value={review.id} />
                  <input type="hidden" name="is_published" value={review.is_published.toString()} />
                  <button 
                    type="submit"
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                      review.is_published 
                        ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700' 
                        : 'bg-[#10164A] hover:bg-[#1c246e] text-white'
                    }`}
                  >
                    {review.is_published ? <><EyeOff className="w-3 h-3"/> Hide</> : <><Eye className="w-3 h-3"/> Publish</>}
                  </button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-[#eaeaea] p-12 text-center text-[#595959]">
            <div className="flex flex-col items-center justify-center gap-2">
              <MessageSquareQuote className="w-8 h-8 text-[#888888] mb-2" />
              <p className="font-medium">No reviews found</p>
              <p className="text-xs">Add corporate testimonials or wait for customer reviews.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
