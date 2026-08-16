import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://rcreationframes.com'),
  title: {
    template: '%s | R Creation — Gudiyattam',
    default: 'R Creation — Premium Photo Frames, Trophies & Custom Gifts | Gudiyattam, Vellore',
  },
  description: 'Manufacturer & wholesaler of synthetic photo frames, crystal trophies, wooden mementos, personalized gifts, and framing accessories in Gudiyattam, Vellore, Tamil Nadu. Wholesale MOQ 10 units.',
  keywords: ['R Creation', 'photo frames', 'Gudiyattam', 'Vellore', 'wholesale frames', 'crystal trophies', 'wooden mementos', 'custom gifts', 'Tamil Nadu'],
  authors: [{ name: 'R Creation' }],
  openGraph: {
    title: 'R Creation — Premium Photo Frames & Custom Gifts',
    description: 'Factory-direct wholesale & retail. Synthetic photo frames, crystal trophies, LED acrylic displays from Gudiyattam, Vellore.',
    siteName: 'R Creation',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'R Creation — Premium Photo Frames & Custom Gifts',
    description: 'Factory-direct wholesale & retail. Synthetic photo frames, crystal trophies, LED acrylic displays from Gudiyattam, Vellore.',
    images: ['https://rcreationframes.com/icon.svg'],
  },
};

import { Montserrat, Jost, Cormorant_Garamond } from 'next/font/google';
import { ToastProvider } from '@/components/shared/ToastContext';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

const jost = Jost({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jost',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
});

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "ManufacturingBusiness",
  "name": "R Creation",
  "url": "https://rcreationframes.com",
  "logo": "https://rcreationframes.com/logo.svg",
  "image": "https://rcreationframes.com/logo.svg",
  "description": "Manufacturer & wholesaler of synthetic photo frames, crystal trophies, wooden mementos, and personalized gifts.",
  "priceRange": "₹₹",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-8754940610",
    "contactType": "customer service",
    "areaServed": "IN",
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
    "latitude": "12.9472",
    "longitude": "78.8711"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${jost.variable} ${cormorant.variable} font-sans`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema).replace(/</g, '\\u003c') }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-FJSLXW6598" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-FJSLXW6598');`
          }}
        />
      </head>
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
