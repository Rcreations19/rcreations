import React from 'react';
import HomePageClient from '@/components/storefront/HomePageClient';
import { GoogleReviews } from '@/components/storefront/GoogleReviews';
import { TopSellers } from '@/components/storefront/TopSellers';
import { getPublicBlogs } from '@/lib/actions/blogs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Where is R Creation located?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "R Creation is a factory-direct manufacturer located in Gudiyattam, Vellore, Tamil Nadu. We supply synthetic photo frames, crystal trophies, and wooden mementos locally within Vellore, Gudiyattam, and a 40km radius."
      }
    },
    {
      "@type": "Question",
      "name": "What is the minimum order quantity (MOQ) for wholesale?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our wholesale pricing starts at a minimum order quantity (MOQ) of just 10 units for most frames and trophies."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer custom laser engraving?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we provide custom laser engraving on wooden mementos, crystal trophies, and acrylic displays."
      }
    },
    {
      "@type": "Question",
      "name": "Can I order a single custom photo frame?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! We cater to both retail and wholesale customers. You can use our interactive configurator to design and order a single custom frame."
      }
    }
  ]
};

export default async function HomePage() {
  const blogs = await getPublicBlogs().catch(() => []);
  const latestBlogs = (blogs || []).slice(0, 3);

  return (
    <>
      <HomePageClient latestBlogs={latestBlogs} topSellers={<TopSellers />}>
        <GoogleReviews />
      </HomePageClient>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }} />
    </>
  );
}

