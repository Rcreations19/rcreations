import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, Building2, ShieldCheck, Factory } from 'lucide-react';
import { TopSellers } from '@/components/storefront/TopSellers';
import { GoogleReviews } from '@/components/storefront/GoogleReviews';

export const metadata: Metadata = {
  title: 'Wholesale Photo Frames & Crystal Trophies in Vellore | R Creation',
  description: 'Skip the middlemen. R Creation is a factory-direct manufacturer of wholesale photo frames, optic crystal trophies, and custom gifts serving Vellore, Gudiyattam, and Ranipet.',
  alternates: {
    canonical: '/locations/vellore',
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "R Creation - Wholesale Photo Frames & Trophies Vellore",
  "description": "Factory-direct manufacturer of synthetic photo frames, crystal trophies, and wooden mementos in Gudiyattam and Vellore.",
  "areaServed": ["Vellore", "Gudiyattam", "Ranipet", "Ambur", "Vaniyambadi"],
  "telephone": "+91-8754940610",
  "url": "https://rcreationframes.com/locations/vellore"
};

export default function VelloreLocationPage() {
  return (
    <div className="bg-surface min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema).replace(/</g, '\\u003c') }} />
      
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full opacity-10 translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary rounded-full opacity-10 -translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-sm font-semibold tracking-wider text-accent uppercase mb-6">
            Serving Vellore District
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Wholesale Photo Frames &<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">Custom Trophies in Vellore</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-10">
            Skip the Long Bazaar middlemen. R Creation is a Gudiyattam-based factory offering direct manufacturing pricing on synthetic photo frames, crystal trophies, and custom wooden mementos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products" className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-accent text-primary font-bold hover:scale-105 transition-transform">
              Browse Wholesale Catalog
            </Link>
            <Link href="/wholesale" className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-colors">
              View Wholesale Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us vs Middlemen */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Why Buy Factory Direct?</h2>
            <p className="text-primary/60 max-w-2xl mx-auto text-lg">
              Many frame shops in Vellore buy from manufacturers and mark up the prices. When you buy from R Creation, you get true wholesale margins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface p-8 rounded-2xl border border-border">
              <Factory className="w-10 h-10 text-accent mb-6" />
              <h3 className="text-xl font-bold text-primary mb-3">Direct Manufacturing</h3>
              <p className="text-primary/70">
                We manufacture our synthetic photo frames and acrylic LED displays in-house in Gudiyattam, passing the savings directly to you.
              </p>
            </div>
            <div className="bg-surface p-8 rounded-2xl border border-border">
              <ShieldCheck className="w-10 h-10 text-accent mb-6" />
              <h3 className="text-xl font-bold text-primary mb-3">Low MOQ of 10 Units</h3>
              <p className="text-primary/70">
                Whether you run a small photo studio in Ranipet or need corporate trophies in Vellore, our Minimum Order Quantity is incredibly accessible.
              </p>
            </div>
            <div className="bg-surface p-8 rounded-2xl border border-border">
              <Building2 className="w-10 h-10 text-accent mb-6" />
              <h3 className="text-xl font-bold text-primary mb-3">Custom Laser Engraving</h3>
              <p className="text-primary/70">
                Need names and dates on crystal trophies? We handle precision laser engraving and sublimation printing on-site.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Sellers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <h2 className="text-3xl font-bold text-primary">Popular in Vellore</h2>
        </div>
        <TopSellers />
      </section>

      {/* Service Areas */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MapPin className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">Our Delivery Radius</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-10 text-lg">
            We provide fast, reliable delivery for bulk orders across the entire Vellore district.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Vellore City', 'Gudiyattam', 'Ranipet', 'Ambur', 'Vaniyambadi', 'Arcot', 'Walajapet'].map((city) => (
              <span key={city} className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium">
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <div className="pb-20">
        <GoogleReviews />
      </div>

    </div>
  );
}
