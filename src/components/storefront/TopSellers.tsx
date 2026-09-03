import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Trophy, ArrowRight } from 'lucide-react';
import { getBestsellerProducts } from '@/lib/actions/storefront';

import { BestsellerCard } from '@/components/storefront/BestsellerCard';


// ── Section (async Server Component) ──────────────────────────────────────
export async function TopSellers() {
  let products;
  try {
    products = await getBestsellerProducts(8);
  } catch (e) {
    console.error('[TopSellers] Failed to load products:', e);
    return null;
  }

  // Nothing in DB at all — render nothing
  if (!products || products.length === 0) return null;

  // Did we get real curated bestsellers or the fallback?
  const isCurated = products.some(p => p.is_curated);

  return (
    <section
      className="py-14 sm:py-20 bg-transparent border-b border-neutral-100/50"
      aria-labelledby="top-sellers-heading"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-block w-8 h-[2px] bg-accent" />
              <span className="text-accent text-xs font-bold tracking-[0.22em] uppercase">
                {isCurated ? 'Customer Favourites' : 'Featured Products'}
              </span>
            </div>
            <h2
              id="top-sellers-heading"
              className="text-3xl sm:text-4xl font-semibold text-primary tracking-tight leading-tight"
            >
              {isCurated ? 'Our Top Sellers' : 'New Arrivals'}
            </h2>
            <p className="text-neutral-500 text-sm mt-2 max-w-md">
              {isCurated
                ? 'Handpicked from our factory floor — the products our customers order again and again.'
                : 'Explore our latest collection of premium frames, trophies, and custom gifts.'}
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary
                       hover:text-accent transition-colors group shrink-0
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            <span className="border-b border-primary/20 group-hover:border-accent transition-colors pb-0.5">
              View All Products
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── Product grid ──
            Mobile  : horizontal snap-scroll
            Tablet  : 3 columns
            Desktop : 4 columns                                              */}
        <div
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory
                     sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0
                     lg:grid-cols-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product, i) => (
            <BestsellerCard key={product.id} product={product} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
