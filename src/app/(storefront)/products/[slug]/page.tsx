import React from 'react';
import { notFound } from 'next/navigation';
import { getPublicProductBySlug, getPublicRelatedProducts } from '@/lib/actions/storefront';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';
import type { Metadata } from 'next';

export const revalidate = 3600; // 1 hour ISR

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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
    }
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    const product = await getPublicProductBySlug(slug);
    
    if (!product) {
      return notFound();
    }

    const relatedProducts = await getPublicRelatedProducts(product.category_id, product.id);

    // Schema generation
    const productSchema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.title,
      "image": product.image_url,
      "description": product.description || product.subtitle,
      "sku": product.id,
      "brand": {
        "@type": "Brand",
        "name": "R Creation"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://rcreationframes.com/products/${product.slug}`,
        "priceCurrency": "INR",
        "price": product.price,
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating || "5.0",
        "reviewCount": product.review_count || 0
      }
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
          "name": "Catalog",
          "item": "https://rcreationframes.com/products"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": product.title
        }
      ]
    };

    let actualFaqs: {question: string, answer: string}[] = [];
    if (product.specifications) {
      try {
        const parsed = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          actualFaqs = parsed.faqs || [];
        }
      } catch (e) {
        // ignore
      }
    }

    if (actualFaqs.length === 0) {
      actualFaqs = [
        {
          question: "What is the minimum order quantity (MOQ) for wholesale pricing?",
          answer: `The minimum order quantity for this product is ${product.moq} units.`
        },
        {
          question: "Does this frame come with a glass front?",
          answer: `Yes, our frames use high-quality clear acrylic or glass depending on the ${product.material} specification.`
        },
        {
          question: "Do you offer pan-India shipping for bulk orders?",
          answer: "Yes, we offer secure pan-India shipping directly from our factory in Gudiyattam, Vellore."
        }
      ];
    }

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": actualFaqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    return (
      <>
        <ProductDetailClient product={product} relatedProducts={relatedProducts} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, '\\u003c') }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }} />
      </>
    );
  } catch (error) {
    return notFound();
  }
}
