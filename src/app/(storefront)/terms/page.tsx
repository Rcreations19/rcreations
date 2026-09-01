import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions governing orders, returns, data processing, and services provided by R Creation, Gudiyattam.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="pt-8 md:pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors mb-8">
        <ArrowLeft className="w-3 h-3" /> Back to Home
      </Link>

      <h1 className="text-3xl font-extrabold text-secondary tracking-tight mb-2">Terms &amp; Conditions</h1>
      <p className="text-xs text-neutral-500 font-mono mb-1">Last updated: September 2026</p>
      <p className="text-xs text-neutral-400 font-mono mb-10">
        These terms comply with the <strong>Consumer Protection Act, 2019</strong>,{' '}
        <strong>Information Technology Act, 2000</strong>, and{' '}
        <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong> of India.
      </p>

      <div className="prose prose-sm prose-neutral max-w-none space-y-8 text-neutral-700 leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-secondary">1. Acceptance of Terms</h2>
          <p>
            By accessing the R Creation website (<a href="https://www.rcreationframes.com" className="text-accent hover:underline">rcreationframes.com</a>)
            or placing an order, you agree to be bound by these Terms &amp; Conditions and our{' '}
            <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
            If you do not agree, please do not use our website or services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">2. Orders &amp; Pricing</h2>
          <p>
            All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST unless stated otherwise.
            Wholesale pricing is available for orders meeting the minimum order quantity (MOQ) of 10 units per product.
            We reserve the right to modify prices without prior notice; however, confirmed orders will be honoured at
            the price quoted at the time of confirmation.
          </p>
          <p className="mt-2">
            An order is considered confirmed only after you receive a written confirmation from R Creation (via email
            or WhatsApp). We reserve the right to refuse or cancel any order at our discretion, in which case a full
            refund will be issued for any prepaid amount.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">3. Payment</h2>
          <p>
            We currently accept <strong>Cash on Delivery (COD)</strong> for orders within our local delivery radius
            (40 km from Gudiyattam, Vellore). Prepaid orders via NEFT/RTGS are accepted for B2B wholesale transactions.
            Payment links or gateway options may be introduced in the future and will be disclosed at checkout.
          </p>
          <p className="mt-2">
            For custom or engraved orders, a 50% advance payment may be required before production commences.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">4. Delivery</h2>
          <p>
            Standard catalogue items are manufactured and dispatched within <strong>1–3 business days</strong>.
            Custom engraved or built-to-order items require <strong>3–5 business days</strong>. Local delivery within
            40 km is handled by our own transport. Shipping charges of ₹500 (flat rate) apply for orders below ₹10,000.
            Orders of ₹10,000 and above qualify for free local delivery.
          </p>
          <p className="mt-2">
            Delivery timelines are estimates and may be affected by public holidays, force majeure events, or
            production complexity. We will communicate any significant delays promptly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">5. Returns &amp; Refunds</h2>
          <p>
            Due to the custom and made-to-order nature of our products, returns are accepted only for:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Manufacturing defects (structural faults not caused by customer use)</li>
            <li>Damage during transit (must be documented with photographs on delivery)</li>
          </ul>
          <p className="mt-2">
            Return claims must be reported within <strong>48 hours of delivery</strong> with photographic evidence
            sent to <a href="mailto:rcreationsstudio@gmail.com" className="text-accent hover:underline">rcreationsstudio@gmail.com</a> or
            via WhatsApp. Refunds, where applicable, are processed within 7–10 business days via the original payment method
            or NEFT transfer.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">6. Custom Orders</h2>
          <p>
            Custom frames, trophies, and engraved items are manufactured to your specifications. Once a design proof
            is approved by the customer and production begins, cancellations are not accepted. R Creation is not
            responsible for errors in customer-provided text, logos, or images after written proof approval.
          </p>
          <p className="mt-2">
            You warrant that any text, image, or logo submitted for a custom order does not infringe any third-party
            intellectual property rights. R Creation accepts no liability for claims arising from customer-supplied content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">7. User Accounts</h2>
          <p>
            If you create an account on our website, you are responsible for maintaining the confidentiality of your
            login credentials. You agree to notify us immediately at{' '}
            <a href="mailto:rcreationsstudio@gmail.com" className="text-accent hover:underline">rcreationsstudio@gmail.com</a> if
            you suspect unauthorized access to your account. R Creation is not liable for losses resulting from
            unauthorized use of your credentials.
          </p>
          <p className="mt-2">
            You may request deletion of your account and associated personal data at any time. See our{' '}
            <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link> for data retention details.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">8. Data Processing &amp; Consent</h2>
          <p>
            By placing an order or submitting an inquiry, you consent to R Creation processing your personal data
            as described in our <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>, for
            the purposes of order fulfilment, customer communication, and statutory obligations.
          </p>
          <p className="mt-2">
            Consent to analytics cookies is separate and optional. You may accept or reject analytics tracking
            via the cookie banner displayed on your first visit. Your cookie preferences do not affect your ability
            to place orders or use any core feature of our website.
          </p>
          <p className="mt-2">
            For full details on the data we collect, how we use it, and your rights under India&rsquo;s DPDPA 2023,
            please read our <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">9. Cookies &amp; Tracking</h2>
          <p>
            Our website uses strictly necessary cookies (authentication, cart) and, with your consent, analytics
            cookies (Google Analytics 4). You may manage your preferences at any time by clearing your browser cookies
            to reset the consent banner. For a full breakdown of cookies used, see our{' '}
            <Link href="/cookies" className="text-accent hover:underline">Cookie Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">10. Intellectual Property</h2>
          <p>
            All content on this website — including product images, descriptions, logos, design templates, and
            underlying code — is the property of R Creation and protected under applicable Indian copyright and
            trademark laws. Unauthorized reproduction, redistribution, or commercial use is strictly prohibited without
            prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">11. Limitation of Liability</h2>
          <p>
            R Creation&rsquo;s aggregate liability for any claim arising from these terms or our services is limited to
            the value of the specific product order in question. To the fullest extent permitted by law, we are not
            liable for indirect, incidental, special, or consequential damages, including loss of profit, loss of data,
            or business interruption arising from the use of our products, website, or services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">12. Dispute Resolution</h2>
          <p>
            If a dispute arises in connection with these terms, both parties agree to first attempt to resolve the
            matter amicably through good-faith negotiation within 30 days of written notice. If no resolution is
            reached, the matter shall be referred to mediation before initiating formal legal proceedings.
          </p>
          <p className="mt-2">
            These terms are governed by the laws of India. Any disputes that cannot be resolved amicably or through
            mediation shall be subject to the exclusive jurisdiction of the courts in <strong>Vellore, Tamil Nadu</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">13. Changes to These Terms</h2>
          <p>
            We may update these Terms &amp; Conditions from time to time. The revised terms will take effect upon posting
            on our website. Continued use of our website or services after changes constitutes your acceptance of the
            updated terms. We will update the &ldquo;Last updated&rdquo; date at the top of this page with every revision.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">14. Contact</h2>
          <p>
            For questions about these terms:<br />
            <strong>R Creation</strong>, Gudiyattam, Vellore District, Tamil Nadu — 632602<br />
            Phone: <a href="tel:+918754940610" className="text-accent hover:underline">+91 87549 40610</a><br />
            Email: <a href="mailto:rcreationsstudio@gmail.com" className="text-accent hover:underline">rcreationsstudio@gmail.com</a>
          </p>
        </section>

      </div>
    </div>
  );
}
