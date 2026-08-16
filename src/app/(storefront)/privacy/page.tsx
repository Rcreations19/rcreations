import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for R Creation — how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="pt-8 md:pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors mb-8">
        <ArrowLeft className="w-3 h-3" /> Back to Home
      </Link>

      <h1 className="text-3xl font-extrabold text-secondary tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-xs text-neutral-500 font-mono mb-10">Last updated: August 2026</p>

      <div className="prose prose-sm prose-neutral max-w-none space-y-8 text-neutral-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-secondary">1. Information We Collect</h2>
          <p>When you place an order or submit an inquiry through R Creation, we collect your name, email address, phone number, shipping address, and any details you provide in your message. We also collect standard web analytics data (page views, referral source, device type) via Google Analytics.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">2. How We Use Your Information</h2>
          <p>We use your information to process orders, respond to inquiries, deliver products within our service area, and send order-related communications (confirmations, dispatch updates). We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">3. Data Storage &amp; Security</h2>
          <p>Your data is stored on Supabase (hosted on AWS infrastructure) with industry-standard encryption at rest and in transit. We implement reasonable administrative, technical, and physical safeguards to protect your information against unauthorized access, alteration, disclosure, or destruction.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">4. Cookies &amp; Analytics</h2>
          <p>We use Google Analytics cookies to understand how visitors interact with our website. These cookies collect anonymized usage data. You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#2aabb0] hover:underline">Google Analytics Opt-out Browser Add-on</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">5. Third-Party Services</h2>
          <p>We use WhatsApp Business for customer communication. When you click a WhatsApp link on our site, your interaction is governed by <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#2aabb0] hover:underline">WhatsApp&rsquo;s Privacy Policy</a>. We do not control how WhatsApp handles your data.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:rcreationsstudio@gmail.com" className="text-[#2aabb0] hover:underline">rcreationsstudio@gmail.com</a>. We will respond to your request within 30 days.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">7. Contact</h2>
          <p>For privacy-related inquiries, reach us at:<br />
          R Creation, Gudiyattam, Vellore District, Tamil Nadu — 632602<br />
          Phone: +91 87549 40610<br />
          Email: rcreationsstudio@gmail.com</p>
        </section>
      </div>
    </div>
  );
}
