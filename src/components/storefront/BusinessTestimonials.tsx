import React from 'react';
import { Star, Building2, Quote } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { TestimonialMarquee } from './TestimonialMarquee';

export async function BusinessTestimonials() {
  const supabase = await createClient();
  const { data: dbReviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_published', true)
    .in('order_type', ['Corporate Gift', 'Wholesale Bulk'])
    .order('created_at', { ascending: false })
    .limit(8);

  const reviews = dbReviews || [];

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-28 bg-surface border-t border-neutral-100/50 relative overflow-hidden">
      {/* Background subtle gold glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold-accent/5 rounded-full blur-3xl pointer-events-none -mt-40 -mr-40" />

      <div className="max-w-[100vw] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 flex flex-col items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative mb-6 rounded-full overflow-hidden shadow-[0_8px_30px_rgba(42,171,176,0.15)] ring-4 ring-white">
            <Image src="/images.jpg" alt="Business Partners" fill sizes="112px" className="object-cover" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-primary tracking-tight mb-4 mt-2">
            Trusted by Businesses
          </h2>
          <p className="text-sm md:text-base text-neutral-600 max-w-2xl mx-auto">
            See why leading corporate event organizers, schools, and photography studios across Tamil Nadu choose R Creation for their wholesale framing and gifting needs.
          </p>
        </div>

        {/* Marquee Slider */}
        <TestimonialMarquee reviews={reviews} />

      </div>
    </section>
  );
}
