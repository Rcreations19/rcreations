import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Package, Mail } from 'lucide-react';

export const metadata = {
  title: 'Page Not Found',
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-[#0a0e27]/5 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-5xl font-serif-heading font-bold text-secondary">404</span>
        </div>
        <h1 className="text-3xl font-extrabold text-secondary mb-4">Page Not Found</h1>
        <p className="text-neutral-600 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl text-sm font-bold hover:bg-secondary-hover transition-colors"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-secondary/20 text-secondary rounded-xl text-sm font-bold hover:bg-secondary/5 transition-colors"
          >
            <Package className="w-4 h-4" /> Browse Catalog
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-secondary/20 text-secondary rounded-xl text-sm font-bold hover:bg-secondary/5 transition-colors"
          >
            <Mail className="w-4 h-4" /> Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
