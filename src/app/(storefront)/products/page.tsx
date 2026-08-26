import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import ProductCatalogClient from '@/components/storefront/ProductCatalogClient';
import { getPublicProducts, getPublicCategories } from '@/lib/actions/storefront';

export const revalidate = 3600; // 1 hour ISR

export const metadata: Metadata = {
  title: 'Personalized Gifts & Photo Frames Online',
  description:
    'Factory-direct manufacturer of custom photo frames, crystal trophies, and personalized gifts in India. Shop wholesale and retail from Gudiyattam, Vellore.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Product Catalog | R Creation',
    description:
      'Factory-direct photo frames, crystal trophies, and custom gifts from Gudiyattam, Vellore.',
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://rcreationframes.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Products"
    }
  ]
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getPublicProducts().catch(() => []),
    getPublicCategories().catch(() => [])
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }} />
      <nav aria-label="Breadcrumb" className="bg-transparent max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6 text-sm text-neutral-500 font-medium">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-neutral-900 transition-colors">Home</Link></li>
          <li aria-hidden="true" className="text-neutral-300">/</li>
          <li aria-current="page" className="text-neutral-900">Products</li>
        </ol>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 md:pt-3 pb-3 md:pb-5">
        <div className="mb-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 mb-3">Personalized Gifts & Photo Frames</h1>
          <p className="text-neutral-500 text-base md:text-lg font-medium max-w-3xl leading-relaxed">
            Browse our factory-direct catalog of synthetic photo frames, optic crystal trophies, wooden mementos, and custom gifts.
          </p>
        </div>
      </div>
      <div className="bg-transparent min-h-screen pb-20">
        <React.Suspense fallback={<div className="h-96 flex items-center justify-center">Loading catalog...</div>}>
          <ProductCatalogClient
            initialProducts={products || []}
            categories={categories || []}
          />
        </React.Suspense>
      </div>
    </>
  );
}