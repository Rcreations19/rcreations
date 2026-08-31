'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

type Review = {
  id: string;
  rating: number;
  comment: string;
  business_name?: string;
  author: string;
  order_type: string;
};

interface Props {
  reviews: Review[];
}

export function TestimonialMarquee({ reviews }: Props) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="w-full overflow-hidden py-4 px-4 sm:px-6 flex">
      {/* 4 copies to ensure seamless loop even on ultra-wide screens */}
      {[0, 1, 2, 3].map((copyIndex) => (
        <motion.div 
          key={copyIndex} 
          className="flex items-stretch gap-6 shrink-0 pr-6 will-change-transform" 
          aria-hidden={copyIndex !== 0}
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            duration: 50,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {reviews.map((review, i) => (
            <div 
              key={`${review.id}-${i}`} 
              className="w-[320px] md:w-[400px] shrink-0 glass-panel p-8 rounded-3xl border border-neutral-200 bg-white shadow-[var(--shadow-soft)] hover:shadow-md transition-shadow relative flex flex-col h-full"
            >
              <Quote className="w-10 h-10 text-gold-accent/20 absolute top-6 right-6 pointer-events-none" />
              
              <div className="flex text-gold-accent mb-6">
                {[...Array(review.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              
              <p className="text-primary/80 text-sm md:text-base italic leading-relaxed mb-8 flex-grow">
                &quot;{review.comment}&quot;
              </p>
              
              <div className="mt-auto border-t border-neutral-100 pt-6">
                <p className="font-extrabold text-primary text-sm">{review.business_name || review.author}</p>
                {review.business_name && (
                  <p className="text-xs text-primary/60 font-medium mt-1">{review.author}</p>
                )}
                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {review.order_type}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
