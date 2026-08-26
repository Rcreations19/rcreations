import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductCatalogClient from '@/components/storefront/ProductCatalogClient';
import { getPublicProducts, getPublicCategories } from '@/lib/actions/storefront';

// SEO Keyword Mappings & Meta Tags for Collections
const seoMappings: Record<string, { title: string, description: string, name: string }> = {
  'frames': {
    name: 'Photo Frames',
    title: 'Custom Wooden & Acrylic Photo Frames Online | R Creation',
    description: 'Factory-direct manufacturer of wooden, acrylic, and LED photo frames. Wholesale pricing, custom sizes, and premium quality from Gudiyattam, Vellore.',
  },
  'trophies': {
    name: 'Crystal Trophies',
    title: 'Crystal Trophies & Corporate Gifts | Factory Direct',
    description: 'Browse our collection of optic crystal trophies, wooden mementos, and corporate awards. Custom laser engraving available for B2B events.',
  },
  'gifts': {
    name: 'Personalized Gifts',
    title: 'Personalized Photo Frames & Custom Engraved Gifts',
    description: 'Create unique personalized gifts with custom names, quotes, and photo prints. Perfect for birthdays, anniversaries, and corporate gifting.',
  },
  'accessories': {
    name: 'Accessories',
    title: 'Photo Frame Accessories & Hardware | R Creation',
    description: 'High-quality framing hardware, mounting kits, and presentation boxes for photo studios and gift shops at wholesale prices.',
  }
};

export const revalidate = 3600; // 1 hour ISR

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  
  const seo = seoMappings[decodedSlug];

  if (!seo) {
    return {
      title: 'Collection Not Found',
    };
  }

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `/collections/${slug}`,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    }
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  
  const seo = seoMappings[decodedSlug];

  const [products, categories] = await Promise.all([
    getPublicProducts().catch(() => []),
    getPublicCategories().catch(() => [])
  ]);

  // Check if category actually exists in DB
  const categoryExists = categories.find((c: { slug?: string, name?: string }) => c.slug?.toLowerCase() === decodedSlug || c.name?.toLowerCase().replace(/\s+/g, '-') === decodedSlug);
  if (!categoryExists && !seo) {
    return notFound();
  }

  const categoryName = categoryExists ? categoryExists.name : seo?.name || 'Collection';

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
        "name": "Collections",
        "item": "https://rcreationframes.com/products"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": categoryName
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }} />
      <nav aria-label="Breadcrumb" className="bg-transparent max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6 text-sm text-[#595959]">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/products" className="hover:text-primary transition-colors">Products</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-primary font-medium">{categoryName}</li>
        </ol>
      </nav>

      {seo && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 md:pt-3">
           <div className="mb-4 text-center">
             <h1 className="text-3xl md:text-5xl font-bold text-primary mb-3">{seo.name}</h1>
             <p className="text-[#595959] max-w-2xl mx-auto text-base md:text-lg">{seo.description}</p>
           </div>
        </div>
      )}

      <div className="bg-transparent min-h-screen pb-20 pt-2 md:pt-3">
        <React.Suspense fallback={<div className="h-96 flex items-center justify-center">Loading collection...</div>}>
          <ProductCatalogClient
            initialProducts={products || []}
            categories={categories || []}
            initialCategory={categoryName}
          />
        </React.Suspense>
      </div>
    </>
  );
}
