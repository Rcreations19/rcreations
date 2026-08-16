import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions governing orders, returns, and services provided by R Creation, Gudiyattam.',
};

export default function TermsPage() {
  return (
    <div className="pt-8 md:pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors mb-8">
        <ArrowLeft className="w-3 h-3" /> Back to Home
      </Link>

      <h1 className="text-3xl font-extrabold text-secondary tracking-tight mb-2">Terms of Service</h1>
      <p className="text-xs text-neutral-500 font-mono mb-10">Last updated: August 2026</p>

      <div className="prose prose-sm prose-neutral max-w-none space-y-8 text-neutral-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-secondary">1. Acceptance of Terms</h2>
          <p>By accessing the R Creation website (rcreationframes.com) or placing an order, you agree to be bound by these Terms of Service. If you do not agree, please do not use our website or services.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">2. Orders &amp; Pricing</h2>
          <p>All prices listed are in Indian Rupees (INR) and are inclusive of applicable GST unless stated otherwise. Wholesale pricing is available for orders meeting the minimum order quantity (MOQ) of 10 units per product. We reserve the right to modify prices without prior notice; however, confirmed orders will be honoured at the quoted price.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">3. Payment</h2>
          <p>We currently accept Cash on Delivery (COD) for orders within our local delivery radius (40 km from Gudiyattam, Vellore). Prepaid orders via NEFT/RTGS are accepted for wholesale B2B transactions. Payment gateways may be activated from the admin panel in the future.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">4. Delivery</h2>
          <p>Standard catalog items are manufactured and dispatched within 1–3 business days. Custom engraved or built-to-order items require 3–5 business days. Local delivery within 40 km is handled by our own transport. Shipping charges apply for orders below ₹10,000 (₹500 flat rate). Orders above ₹10,000 qualify for free local delivery.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">5. Returns &amp; Refunds</h2>
          <p>Due to the custom and made-to-order nature of our products, returns are accepted only for manufacturing defects or damage during transit. Claims must be reported within 48 hours of delivery with photographic evidence. Refunds, where applicable, are processed within 7–10 business days.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">6. Custom Orders</h2>
          <p>Custom frames, trophies, and engraved items are manufactured to your specifications. Once a design proof is approved and production begins, cancellations are not accepted. R Creation is not responsible for errors in customer-provided text, logos, or images after proof approval.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">7. Intellectual Property</h2>
          <p>All content on this website — including product images, descriptions, logos, and design templates — is the property of R Creation and protected under applicable Indian copyright and trademark laws. Unauthorized reproduction or use is prohibited.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">8. Limitation of Liability</h2>
          <p>R Creation&rsquo;s liability is limited to the value of the product order in question. We are not liable for indirect, incidental, or consequential damages arising from the use of our products or services.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">9. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Vellore, Tamil Nadu.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">10. Contact</h2>
          <p>For questions about these terms:<br />
          R Creation, Gudiyattam, Vellore District, Tamil Nadu — 632602<br />
          Phone: +91 87549 40610<br />
          Email: rcreationsstudio@gmail.com</p>
        </section>
      </div>
    </div>
  );
}
