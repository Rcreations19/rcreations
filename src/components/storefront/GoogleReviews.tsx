import React from 'react';
import { Star } from 'lucide-react';
import { GoogleReviewsMarquee } from './GoogleReviewsMarquee';
import { createClient } from '@/lib/supabase/server';

export async function GoogleReviews() {
  const supabase = await createClient();
  const { data: dbReviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const reviews = dbReviews || [];

  if (reviews.length === 0) {
    // Honest empty state: hide the section entirely if there are no published reviews.
    return null;
  }

  // Calculate average rating dynamically
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = (totalRating / reviews.length).toFixed(1);
  const totalReviews = reviews.length;

  const displayReviews = reviews.map((r) => ({
    author: r.author,
    role: r.order_type === 'Google Review' ? 'Verified Google Review' : r.order_type,
    rating: r.rating || 5,
    date: r.date || new Date(r.created_at).toLocaleDateString(),
    comment: r.comment || '',
    verified: true,
  }));

  return (
    <section className="py-20 lg:py-28 bg-transparent border-t border-neutral-100/50 relative overflow-hidden">
      {/* Background subtle teal glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-full relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <span className="text-[11px] font-bold font-mono tracking-widest text-accent uppercase mb-2 block">
            Verified Customer Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-primary tracking-tight mb-3">
            Google Reviews & Client Feedback
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto mb-6">
            Real experiences from photography studios, institutional organizers, and gift buyers across Tamil Nadu.
          </p>

          {/* Google Rating Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white shadow-sm border border-neutral-200/80">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="font-bold text-sm text-primary">{averageRating} / 5.0</span>
            </div>
            <div className="flex items-center text-amber-400">
              {[...Array(Math.round(Number(averageRating)))].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs text-neutral-500 font-medium border-l border-neutral-200 pl-3">
              {totalReviews} Verified Reviews
            </span>
          </div>
        </div>

        {/* Infinite CSS Marquee - paused on hover/focus for accessibility */}
        <GoogleReviewsMarquee reviews={displayReviews} />

      </div>
    </section>
  );
}

export default GoogleReviews;
