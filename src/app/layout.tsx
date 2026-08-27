import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.rcreationframes.com'),
  title: {
    template: '%s | R Creation',
    default: 'R Creation — Photo Frames & Custom Gifts in Vellore | Gudiyattam',
  },
  description: 'Wholesale photo frames & crystal trophies in Vellore & Gudiyattam. Factory-direct pricing for studios and events. Manufacturer of synthetic frames, wooden mementos, and personalized gifts. MOQ 10 units.',
  keywords: ['R Creation', 'photo frames', 'Gudiyattam', 'Vellore', 'wholesale frames', 'crystal trophies', 'wooden mementos', 'custom gifts', 'Tamil Nadu'],
  authors: [{ name: 'R Creation' }],
  icons: {
    icon: [
      { url: '/icon.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'R Creation — Premium Photo Frames & Custom Gifts',
    description: 'Factory-direct wholesale & retail. Synthetic photo frames, crystal trophies, LED acrylic displays from Gudiyattam, Vellore.',
    siteName: 'R Creation',
    type: 'website',
    images: [
      {
        url: 'https://www.rcreationframes.com/og-default.png',
        width: 1200,
        height: 630,
        alt: 'R Creation — Premium Photo Frames & Custom Gifts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'R Creation — Premium Photo Frames & Custom Gifts',
    description: 'Factory-direct wholesale & retail. Synthetic photo frames, crystal trophies, LED acrylic displays from Gudiyattam, Vellore.',
    images: ['https://www.rcreationframes.com/og-default.png'],
  },
};

import { Montserrat, Outfit, Cormorant_Garamond } from 'next/font/google';
import { Toaster } from 'sonner';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
});

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": "https://www.rcreationframes.com/#organization",
  "name": "R Creation",
  "url": "https://www.rcreationframes.com",
  "logo": "https://www.rcreationframes.com/logo.svg",
  "image": "https://www.rcreationframes.com/og-default.png",
  "telephone": "+91-8754940610",
  "email": "rcreationsstudio@gmail.com",
  "description": "Manufacturer & wholesaler of synthetic photo frames, crystal trophies, wooden mementos, and personalized gifts.",
  "priceRange": "₹₹",
  "sameAs": [
    "https://www.instagram.com/thercreationframes",
    "https://www.facebook.com/profile.php?id=100091502950429"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-8754940610",
    "contactType": "customer service",
    "areaServed": ["Vellore", "Gudiyattam", "Ranipet", "Ambur", "Vaniyambadi"],
    "availableLanguage": ["English", "Tamil"]
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Gudiyattam",
    "addressLocality": "Gudiyattam",
    "addressRegion": "Tamil Nadu",
    "postalCode": "632602",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "12.94720",
    "longitude": "78.87110"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "20:00"
    }
  ]
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "R Creation",
  "url": "https://www.rcreationframes.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.rcreationframes.com/products?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${outfit.variable} ${cormorant.variable} font-sans`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema).replace(/</g, '\\u003c') }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, '\\u003c') }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FJSLXW6598"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-FJSLXW6598');`
          }}
        />
      </head>
      <body className="antialiased">
        <Toaster richColors position="top-center" expand={true} />
        {children}
      </body>
    </html>
  );
}
