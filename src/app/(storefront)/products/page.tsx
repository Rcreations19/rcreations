import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { getPublicProducts, getPublicCategories } from '@/lib/actions/storefront';

const ProductCatalogClient = dynamic(
  () => import('@/components/storefront/ProductCatalogClient'),
  {
    ssr: false,
    loading: () => <div className="h-96 flex items-center justify-center">Loading catalog...</div>,
  }
);

export const revalidate = 3600; // 1 hour ISR

export const metadata: Metadata = {
  title: 'Photo Frames, Crystal Trophies & Custom Gifts',
  description:
    'Browse our factory-direct catalog of synthetic photo frames, optic crystal trophies, wooden mementos, and personalized gifts from Gudiyattam, Vellore. Wholesale MOQ 10 units.',
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
      <nav aria-label="Breadcrumb" className="bg-transparent max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-12 text-sm text-[#595959]">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-[#0a0e27] transition-colors">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-[#0a0e27] font-medium">Products</li>
        </ol>
      </nav>
      <div className="bg-transparent min-h-screen pb-20">
        <ProductCatalogClient
          initialProducts={products || []}
          categories={categories || []}
        />
      </div>
    </>
  );
}
