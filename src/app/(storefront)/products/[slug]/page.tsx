import React from 'react';
import { notFound } from 'next/navigation';
import { getPublicProductBySlug, getPublicRelatedProducts } from '@/lib/actions/storefront';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';
import type { Metadata } from 'next';
import { createPublicClient } from '@/lib/supabase/server';

export const revalidate = 3600; // 1 hour ISR

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getPublicProductBySlug(slug);

    if (!product) {
      return {
        title: 'Product Not Found',
      };
    }

    return {
      title: product.title,
      description: product.description || product.subtitle,
      alternates: {
        canonical: `/products/${slug}`,
      },
      openGraph: {
        title: product.title,
        description: product.description || product.subtitle,
        images: product.image_url ? [product.image_url] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: product.description || product.subtitle,
        images: product.image_url ? [product.image_url] : [],
      },
    };
  } catch {
    return { title: 'Product' };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await getPublicProductBySlug(slug).catch(() => null);

  if (!product) {
    return notFound();
  }

  const relatedProducts = await getPublicRelatedProducts(product).catch(() => []);

  // ── Fetch published reviews for aggregateRating + review schema ────────────
  const supabase = createPublicClient();
  const { data: publishedReviews } = await supabase
    .from('reviews')
    .select('author, rating, comment, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(10);

  const reviews = publishedReviews || [];
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating ?? 5), 0) / reviewCount).toFixed(1)
      : '5.0';

  // ── Merchant return policy (fixes "hasMerchantReturnPolicy") ──────────────
  const returnPolicy = {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'IN',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 2,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/FreeReturn',
    refundType: 'https://schema.org/FullRefund',
  };

  // ── Shipping details (fixes "shippingDetails") ─────────────────────────────
  const shippingDetails = {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: '500',
      currency: 'INR',
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'IN',
      addressRegion: ['Tamil Nadu'],
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 3,
        unitCode: 'DAY',
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 2,
        unitCode: 'DAY',
      },
    },
  };

  // ── Product schema ────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = product as any;

  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: product.image_url,
    description: product.description || product.subtitle,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'R Creation',
    },
    offers: {
      '@type': 'Offer',
      url: `https://rcreationframes.com/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      availability:
        (p.inventory_count ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'R Creation',
        url: 'https://rcreationframes.com',
      },
      // ✅ FIX #3: hasMerchantReturnPolicy
      hasMerchantReturnPolicy: returnPolicy,
      // ✅ FIX #4: shippingDetails
      shippingDetails,
    },
  };

  // ✅ FIX #2: aggregateRating — populated from real published reviews
  // ✅ FIX #1: review — include up to 3 published reviews
  if (reviewCount > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount,
      bestRating: '5',
      worstRating: '1',
    };

    productSchema.review = reviews.slice(0, 3).map((r) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(r.rating ?? 5),
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: r.comment,
      datePublished: new Date(r.created_at).toISOString().split('T')[0],
    }));
  }

  // ── Breadcrumb schema ─────────────────────────────────────────────────────
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://rcreationframes.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Catalog',
        item: 'https://rcreationframes.com/products',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
      },
    ],
  };

  // ── FAQ schema ────────────────────────────────────────────────────────────
  let actualFaqs: { question: string; answer: string }[] = [];
  if (product.specifications) {
    try {
      const parsed =
        typeof product.specifications === 'string'
          ? JSON.parse(product.specifications)
          : product.specifications;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        actualFaqs = parsed.faqs || [];
      }
    } catch {
      // ignore
    }
  }

  if (actualFaqs.length === 0) {
    actualFaqs = [
      {
        question: 'What is the minimum order quantity (MOQ) for wholesale pricing?',
        answer: `The minimum order quantity for this product is ${product.moq} units.`,
      },
      {
        question: 'Does this frame come with a glass front?',
        answer: `Yes, our frames use high-quality clear acrylic or glass depending on the ${product.material} specification.`,
      },
      {
        question: 'Do you offer delivery for bulk orders?',
        answer:
          'Yes, we offer local delivery for bulk orders strictly within Vellore, Gudiyattam, and a 40km radius from our factory.',
      },
    ];
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: actualFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
