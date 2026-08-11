import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://rcreationframes.com'),
  title: {
    template: '%s | R Creation — Gudiyattam',
    default: 'R Creation — Premium Photo Frames, Trophies & Custom Gifts | Gudiyattam, Vellore',
  },
  description: 'Manufacturer & wholesaler of synthetic photo frames, crystal trophies, wooden mementos, personalized gifts, and framing accessories in Gudiyattam, Vellore, Tamil Nadu. Wholesale MOQ 10 units. CEO: Mr. Sankaran Raveendiran.',
  keywords: ['R Creation', 'photo frames', 'Gudiyattam', 'Vellore', 'wholesale frames', 'crystal trophies', 'wooden mementos', 'custom gifts', 'Tamil Nadu'],
  authors: [{ name: 'R Creation' }],
  openGraph: {
    title: 'R Creation — Premium Photo Frames & Custom Gifts',
    description: 'Factory-direct wholesale & retail. Synthetic photo frames, crystal trophies, LED acrylic displays from Gudiyattam, Vellore.',
    siteName: 'R Creation',
    type: 'website',
  },
};

import { Montserrat, Jost, Cormorant_Garamond } from 'next/font/google';
import { ToastProvider } from '@/components/shared/ToastContext';
import Script from 'next/script';

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
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${jost.variable} ${cormorant.variable} font-sans`}>
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
        <Script
          id="org-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "R Creation",
              "url": "https://rcreationframes.com",
              "logo": "https://rcreationframes.com/logo.svg",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-7942874626",
                "contactType": "customer service",
                "areaServed": "IN",
                "availableLanguage": ["English", "Tamil"]
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Gudiyattam",
                "addressRegion": "Tamil Nadu",
                "addressCountry": "IN"
              }
            }).replace(/</g, '\\u003c')
          }}
        />
      </body>
    </html>
  );
}
