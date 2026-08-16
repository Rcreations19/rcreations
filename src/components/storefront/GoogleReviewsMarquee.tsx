'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Star, ShieldCheck, Quote } from 'lucide-react';

interface Review {
  author: string;
  role: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export function GoogleReviewsMarquee({ reviews }: { reviews: Review[] }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = reviews.length;

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setActive((prev) => (dir > 0 ? (prev + 1) % count : (prev - 1 + count) % count));
  }, [count]);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > active ? 1 : -1);
    setActive(idx);
  }, [active]);

  // Auto-advance; pause on hover/focus for accessibility
  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(() => go(1), 5200);
    return () => clearInterval(t);
  }, [paused, count, go]);

  if (!count) return null;

  const variants: Variants = {
    enter: (d: number) => ({
      x: d >= 0 ? '60%' : '-60%',
      opacity: 0,
      scale: 0.82,
      filter: 'blur(6px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (d: number) => ({
      x: d >= 0 ? '-60%' : '60%',
      opacity: 0,
      scale: 0.82,
      filter: 'blur(6px)',
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const r = reviews[active];
  const prev = reviews[(active - 1 + count) % count];
  const next = reviews[(active + 1) % count];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Center spotlight beam */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(ellipse at center, rgba(42,171,176,0.22), transparent 70%)' }}
        aria-hidden
      />

      {/* Stage */}
      <div className="relative mx-auto flex h-[30rem] max-w-6xl items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Neighbor — previous (hidden on mobile) */}
        <button
          onClick={() => go(-1)}
          aria-label="Previous review"
          className="absolute left-2 hidden h-[24rem] w-[26%] max-w-xs shrink-0 select-none rounded-2xl border border-neutral-200/70 bg-white/70 p-6 opacity-40 shadow-[var(--shadow-soft)] backdrop-blur-sm transition-all duration-500 hover:opacity-70 lg:block"
        >
          <ReviewBody review={prev} />
        </button>

        {/* Neighbor — next (hidden on mobile) */}
        <button
          onClick={() => go(1)}
          aria-label="Next review"
          className="absolute right-2 hidden h-[24rem] w-[26%] max-w-xs shrink-0 select-none rounded-2xl border border-neutral-200/70 bg-white/70 p-6 opacity-40 shadow-[var(--shadow-soft)] backdrop-blur-sm transition-all duration-500 hover:opacity-70 lg:block"
        >
          <ReviewBody review={next} flip />
        </button>

        {/* Active center card */}
        <div className="relative z-20 h-full w-full max-w-xl">
          <AnimatePresence custom={direction} mode="popLayout" initial={false}>
            <motion.article
              key={active}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 flex h-full w-full flex-col justify-between overflow-hidden rounded-3xl border-2 border-[#2aabb0]/55 bg-white p-7 shadow-[0_24px_60px_-20px_rgba(10,14,39,0.25),0_0_30px_rgba(42,171,176,0.25)] sm:p-9"
            >
              {/* glow ring */}
              <div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-60"
                style={{ boxShadow: '0 0 0 1px rgba(42,171,176,0.45) inset' }}
                aria-hidden
              />
              <Quote className="absolute -top-2 right-5 h-16 w-16 text-[#2aabb0]/10" aria-hidden />
              <ReviewBody review={r} active />
            </motion.article>
          </AnimatePresence>
        </div>
      </div>

      {/* Dot navigation — one per review, active emphasized */}
      <div className="mt-6 flex items-center justify-center gap-2.5">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to review ${i + 1}`}
            aria-current={i === active}
            className="group px-1.5 py-2"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-500 ${
                i === active
                  ? 'w-8 bg-[#2aabb0] shadow-[0_0_10px_rgba(42,171,176,0.7)]'
                  : 'w-2 bg-neutral-300 group-hover:bg-neutral-400'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewBody({
  review,
  active,
  flip,
}: {
  review: Review;
  active?: boolean;
  flip?: boolean;
}) {
  return (
    <div className={`flex h-full flex-col justify-between ${flip ? 'text-right' : ''}`}>
      <div>
        <div className={`mb-4 flex items-center justify-between ${flip ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-0.5 text-[#F5B838]">
            {[...Array(review.rating)].map((_, idx) => (
              <Star key={idx} className="h-4 w-4 fill-[#F5B838] text-[#F5B838]" />
            ))}
          </div>
          <span className="font-mono text-[11px] text-neutral-400">{review.date}</span>
        </div>
        <p
          className={`text-sm leading-relaxed text-neutral-700 ${
            active ? 'line-clamp-5 sm:text-[15px]' : 'line-clamp-4'
          }`}
        >
          &ldquo;{review.comment}&rdquo;
        </p>
      </div>

      <div className={`mt-6 flex items-center justify-between border-t border-neutral-100 pt-4 ${flip ? 'flex-row-reverse' : ''}`}>
        <div className={flip ? 'text-right' : ''}>
          <h4 className="truncate text-sm font-bold text-[#0a0e27]">{review.author}</h4>
          <p className="truncate text-xs text-neutral-500">{review.role}</p>
        </div>
        {review.verified && (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verified</span>
          </div>
        )}
      </div>
    </div>
  );
}
