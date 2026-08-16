import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { getBestsellerProducts } from '@/lib/actions/storefront';

// Explicit type — driven by the explicit return type in storefront.ts (no inference issues)
type BestsellerProduct = Awaited<ReturnType<typeof getBestsellerProducts>>[number];

// ── Product Card ───────────────────────────────────────────────────────────
function BestsellerCard({ product, index }: { product: BestsellerProduct; index: number }) {
  const hasWholesale = product.wholesale_price > 0 && product.wholesale_price < product.price;
  const discount = hasWholesale
    ? Math.round(((product.price - product.wholesale_price) / product.price) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-neutral-100 overflow-hidden
                 hover:border-[#2aabb0]/40 hover:shadow-[0_8px_30px_rgba(42,171,176,0.12)]
                 transition-all duration-300 snap-start shrink-0
                 w-[240px] sm:w-auto"
      aria-label={product.title}
    >
      {/* ── Image ── */}
      <div className="relative aspect-[4/5] bg-neutral-50 overflow-hidden group/image">
        {/* Primary Image */}
        <Image
          src={product.image_url}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 240px, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
            product.gallery_images && product.gallery_images.length > 1 ? 'group-hover/image:opacity-0' : ''
          }`}
          priority={index < 4}
        />
        
        {/* Secondary Image (Hover State) */}
        {product.gallery_images && product.gallery_images.length > 1 && (
          <Image
            src={product.gallery_images[1]}
            alt={`${product.title} Alternate View`}
            fill
            sizes="(max-width: 640px) 240px, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-0 transition-all duration-700 ease-out absolute inset-0 group-hover/image:opacity-100 group-hover:scale-105"
          />
        )}

        {/* Badges — only show Bestseller badge for real curated products */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.is_curated && (
            <span className="inline-flex items-center gap-1 bg-[#0a0e27] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-sm tracking-wider">
              <Trophy className="w-2.5 h-2.5 fill-[#F5B838] text-[#F5B838]" />
              Best Seller
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black font-mono uppercase px-2.5 py-1 rounded shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="inline-flex items-center gap-1.5 bg-white text-[#0a0e27] text-xs font-bold px-4 py-2 rounded-full shadow-lg">
            View Product <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-[#0a0e27] leading-snug line-clamp-2 mb-1 group-hover:text-[#2aabb0] transition-colors">
          {product.title}
        </h3>
        {product.subtitle && (
          <p className="text-[11px] text-neutral-500 line-clamp-1 mb-3">{product.subtitle}</p>
        )}

        {/* Rating stars */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.round(product.rating)
                    ? 'fill-[#F5B838] text-[#F5B838]'
                    : 'fill-neutral-200 text-neutral-200'
                }`}
              />
            ))}
            <span className="text-[10px] text-neutral-500 font-mono ml-1">
              ({product.review_count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-3 border-t border-neutral-100">
          {hasWholesale ? (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Wholesale</span>
                <span className="text-xs text-neutral-400 line-through font-mono">₹{product.price}</span>
              </div>
              <span className="text-lg font-black text-[#0a0e27] font-mono tabular-nums">
                ₹{product.wholesale_price}
              </span>
            </div>
          ) : (
            <span className="text-lg font-black text-[#0a0e27] font-mono tabular-nums">
              ₹{product.price}
            </span>
          )}
          <p className="text-[10px] text-neutral-400 mt-0.5">
            MOQ {product.moq} unit{product.moq > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── Section (async Server Component) ──────────────────────────────────────
export async function TopSellers() {
  const products = await getBestsellerProducts(8);

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
              <span className="inline-block w-8 h-[2px] bg-[#2aabb0]" />
              <span className="text-[#2aabb0] text-xs font-bold tracking-[0.22em] uppercase">
                {isCurated ? 'Customer Favourites' : 'Featured Products'}
              </span>
            </div>
            <h2
              id="top-sellers-heading"
              className="text-3xl sm:text-4xl font-semibold text-[#0a0e27] tracking-tight leading-tight"
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
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0a0e27]
                       hover:text-[#2aabb0] transition-colors group shrink-0
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2aabb0] rounded"
          >
            <span className="border-b border-[#0a0e27]/20 group-hover:border-[#2aabb0] transition-colors pb-0.5">
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
