'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Trophy, ArrowRight } from 'lucide-react';

export type BestsellerProductData = {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  price: number;
  wholesale_price: number;
  moq: number;
  rating: number;
  review_count: number;
  image_url: string;
  gallery_images: string[];
  is_bestseller: boolean;
  is_curated: boolean;
};

export function BestsellerCard({ product, index }: { product: BestsellerProductData; index: number }) {
  // Lazy-load the hover image: only mount it after the first mouseenter.
  // This avoids pre-fetching N secondary images on page load (one per card in view).
  const [hasHovered, setHasHovered] = useState(false);

  const hasWholesale = product.wholesale_price > 0 && product.wholesale_price < product.price;
  const discount = hasWholesale
    ? Math.round(((product.price - product.wholesale_price) / product.price) * 100)
    : 0;
  const hasGallery = !!product.gallery_images && product.gallery_images.length > 1;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-neutral-100 overflow-hidden
                 hover:border-accent/40 hover:shadow-[0_8px_30px_rgba(42,171,176,0.12)]
                 transition-all duration-300 snap-start shrink-0
                 w-[240px] sm:w-auto"
      aria-label={product.title}
    >
      {/* ── Image ── */}
      <div
        className="relative aspect-[4/5] bg-neutral-50 overflow-hidden group/image"
        onMouseEnter={() => { if (!hasHovered) setHasHovered(true); }}
      >
        {/* Primary Image */}
        <Image
          src={product.image_url}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 240px, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
            hasGallery ? 'group-hover/image:opacity-0' : ''
          }`}
          priority={index < 4}
        />

        {/* Secondary Image — only mounted after first hover (zero preload cost) */}
        {hasHovered && hasGallery && (
          <Image
            src={product.gallery_images[1]}
            alt={`${product.title} Alternate View`}
            fill
            sizes="(max-width: 640px) 240px, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-0 transition-all duration-700 ease-out absolute inset-0 group-hover/image:opacity-100 group-hover:scale-105"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.is_curated && (
            <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-sm tracking-wider">
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
          <span className="inline-flex items-center gap-1.5 bg-white text-primary text-xs font-bold px-4 py-2 rounded-full shadow-lg">
            View Product <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-primary leading-snug line-clamp-2 mb-1 group-hover:text-accent transition-colors">
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
              <span className="text-lg font-black text-primary font-mono tabular-nums">
                ₹{product.wholesale_price}
              </span>
            </div>
          ) : (
            <span className="text-lg font-black text-primary font-mono tabular-nums">₹{product.price}</span>
          )}
          <p className="text-[10px] text-neutral-400 mt-0.5">
            MOQ {product.moq} unit{product.moq > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </Link>
  );
}
