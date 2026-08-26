'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

const showcaseImages = [
  {
    src: '/images/slider/slider_photo_frames.png',
    alt: 'Premium Photo Frames',
    category: 'Frames & Displays',
    description: 'Timeless designs that transform your cherished memories into elegant wall art.',
  },
  {
    src: '/images/slider/slider_crystal_trophies.png',
    alt: 'Crystal Trophies',
    category: 'Awards & Trophies',
    description: 'Precision-cut crystal crafted to honour achievement with lasting distinction.',
  },
  {
    src: '/images/slider/slider_custom_gifts.png',
    alt: 'Custom Gifts',
    category: 'Personalised Gifts',
    description: 'Bespoke keepsakes tailored to every occasion, etched with meaning.',
  },
  {
    src: '/images/slider/premium_wooden_memento.png',
    alt: 'Wooden Mementos',
    category: 'Artisan Mementos',
    description: 'Hand-finished wooden pieces that carry warmth, craft, and character.',
  },
  {
    src: '/images/slider/slider_award_collection.png',
    alt: 'Award Collection',
    category: 'Corporate Awards',
    description: 'Statement pieces designed to reflect prestige in every boardroom.',
  },
];

/* ─── Animation variants ─────────────────────────────────────────────────── */
const imgVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.04,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (dir: number) => ({
    x: dir < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const textVariants: Variants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.35 } },
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export function InfiniteSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (idx: number) => {
      setDirection(idx > current ? 1 : -1);
      setCurrent(idx);
    },
    [current],
  );

  const next = useCallback(() => go((current + 1) % showcaseImages.length), [current, go]);
  const prev = useCallback(
    () => go((current - 1 + showcaseImages.length) % showcaseImages.length),
    [current, go],
  );

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [paused, next]);

  const slide = showcaseImages[current];

  return (
    <section
      className="relative w-full overflow-hidden bg-white"
      aria-label="Product showcase"
    >
      {/* ── Thin top accent bar ── */}
      <div className="h-1 w-full bg-gradient-to-r from-[#2aabb0] via-[#38C8CC] to-[#2aabb0]" />

      <div className="mx-auto max-w-[1600px] flex flex-col lg:flex-row min-h-[540px] lg:min-h-[680px]">

        {/* ════════════════════════════════════════
            LEFT — Text panel (light / white)
        ════════════════════════════════════════ */}
        <div className="relative z-10 flex flex-col justify-between w-full lg:w-[42%] xl:w-[38%] bg-white px-8 sm:px-12 xl:px-16 py-14 lg:py-20">

          {/* Label row */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-block w-8 h-[2px] bg-accent" />
              <span className="text-accent text-xs font-bold tracking-[0.22em] uppercase">
                Masterpiece Collection
              </span>
            </div>

            {/* Slide counter */}
            <p className="text-xs font-mono text-neutral-400 mb-3 tabular-nums tracking-widest">
              {String(current + 1).padStart(2, '0')} /{' '}
              {String(showcaseImages.length).padStart(2, '0')}
            </p>

            {/* Animated text block */}
            <div className="overflow-hidden mb-4">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div key={current} custom={direction} variants={textVariants} initial="enter" animate="center" exit="exit">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-accent font-semibold mb-2">
                    {slide.category}
                  </p>
                  <h2 className="text-3xl sm:text-4xl xl:text-5xl font-semibold text-primary leading-[1.1] tracking-tight mb-5">
                    {slide.alt}
                  </h2>
                  <p className="text-neutral-500 text-base leading-relaxed max-w-sm">
                    {slide.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* CTA link */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 mt-2 text-sm font-semibold text-primary hover:text-accent transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <span className="border-b border-primary/20 group-hover:border-accent transition-colors pb-0.5">
                Explore Collection
              </span>
              <ArrowUpRight
                className="w-4 h-4 -translate-y-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-1 transition-transform"
              />
            </Link>
          </div>

          {/* ── Bottom controls ── */}
          <div className="mt-12 flex items-center justify-between">
            {/* Prev / Next */}
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                aria-label="Previous slide"
                className="w-11 h-11 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:border-accent hover:text-accent active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                aria-label="Next slide"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-primary text-white hover:bg-accent active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dot track */}
            <div className="flex items-center gap-2">
              {showcaseImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full"
                >
                  <span
                    className={`block rounded-full transition-all duration-500 ${
                      i === current
                        ? 'w-6 h-2 bg-accent'
                        : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vertical divider (desktop) */}
        <div className="hidden lg:block w-[1px] bg-neutral-100 self-stretch" />

        {/* ════════════════════════════════════════
            RIGHT — Image panel
        ════════════════════════════════════════ */}
        <div
          className="relative w-full lg:flex-1 overflow-hidden bg-neutral-50 min-h-[340px] lg:min-h-0"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={current}
              custom={direction}
              variants={imgVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 62vw"
                className="object-cover"
              />
              {/* Subtle dark vignette along left edge only */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />
              {/* Bottom caption tag */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-white/60 rounded-full px-4 py-1.5 shadow-sm">
                  {/* Inline-keyframe pulse dot — not affected by globals.css reduced-motion */}
                  <style>{`
                    @keyframes rc-pulse {
                      0%, 100% { opacity: 1; transform: scale(1); }
                      50%       { opacity: 0.4; transform: scale(0.75); }
                    }
                    .rc-pulse-dot {
                      animation: rc-pulse 1.8s ease-in-out infinite;
                    }
                  `}</style>
                  <span className="rc-pulse-dot w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  <span className="text-xs font-semibold text-primary tracking-wide">
                    {slide.category}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Vertical progress bar (right edge) */}
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-neutral-100 z-20">
            <motion.div
              className="w-full bg-accent origin-top"
              style={{ height: `${((current + 1) / showcaseImages.length) * 100}%` }}
              animate={{ height: `${((current + 1) / showcaseImages.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </div>

      </div>

      {/* ── Bottom accent bar ── */}
      <div className="h-px w-full bg-neutral-100" />
    </section>
  );
}
