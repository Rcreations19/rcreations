import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for R Creation — how we collect, use, store, and protect your personal information under India\'s DPDPA 2023.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="pt-8 md:pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors mb-8">
        <ArrowLeft className="w-3 h-3" /> Back to Home
      </Link>

      <h1 className="text-3xl font-extrabold text-secondary tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-xs text-neutral-500 font-mono mb-1">Last updated: September 2026</p>
      <p className="text-xs text-neutral-400 font-mono mb-10">
        Prepared in accordance with India&rsquo;s{' '}
        <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong> and the{' '}
        <strong>Information Technology (Reasonable Security Practices) Rules, 2011</strong>.
      </p>

      <div className="prose prose-sm prose-neutral max-w-none space-y-8 text-neutral-700 leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-secondary">1. Who We Are</h2>
          <p>
            R Creation (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a manufacturer and retailer of synthetic photo frames, crystal trophies,
            wooden mementos, and personalized gifts, operating from Gudiyattam, Vellore District, Tamil Nadu — 632602, India.
            Our website is <a href="https://www.rcreationframes.com" className="text-accent hover:underline">rcreationframes.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">2. Information We Collect</h2>
          <p>
            When you place an order, submit an inquiry, or create an account on R Creation, we collect the following
            categories of personal data:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Identity data:</strong> Full name</li>
            <li><strong>Contact data:</strong> Email address, phone number, WhatsApp number</li>
            <li><strong>Location data:</strong> Shipping address, delivery locality</li>
            <li><strong>Transaction data:</strong> Order items, quantities, pricing, payment method chosen</li>
            <li><strong>Technical data:</strong> IP address, browser type, device type, pages visited, referral URL (via Google Analytics — only with your consent)</li>
            <li><strong>Communications data:</strong> Messages you send us via the contact form or WhatsApp</li>
            <li><strong>Custom order data:</strong> Text, images, or logos you submit for engraving or personalization</li>
          </ul>
          <p className="mt-2">We do not collect sensitive personal data (e.g., biometrics, financial account details, health data).</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">3. Legal Basis for Processing</h2>
          <p>
            Under the DPDPA 2023, we process your personal data on the following legal grounds:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Consent:</strong> Analytics cookies and marketing communications (you can withdraw at any time)</li>
            <li><strong>Contract performance:</strong> Processing orders, arranging delivery, handling returns</li>
            <li><strong>Legitimate interest:</strong> Fraud prevention, website security, improving our service</li>
            <li><strong>Legal obligation:</strong> Complying with tax, accounting, and other applicable Indian laws</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">4. How We Use Your Information</h2>
          <p>We use your personal data exclusively to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Process and fulfil your orders</li>
            <li>Communicate order confirmations, dispatch updates, and delivery notifications</li>
            <li>Respond to inquiries and customer support requests</li>
            <li>Manufacture custom or engraved items to your specifications</li>
            <li>Analyse anonymised website traffic to improve user experience (with consent)</li>
            <li>Comply with legal, regulatory, and tax obligations</li>
          </ul>
          <p className="mt-2">
            We do <strong>not</strong> sell, rent, share, or disclose your personal data to third parties for their
            own marketing or commercial purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">5. Data Storage &amp; Security</h2>
          <p>
            Your data is stored on <strong>Supabase</strong> (hosted on AWS infrastructure in the ap-south-1 / Mumbai region),
            with industry-standard encryption at rest (AES-256) and in transit (TLS 1.2+). We implement reasonable
            administrative, technical, and physical safeguards to protect your information against unauthorized access,
            alteration, disclosure, or destruction, as required under the IT (Reasonable Security Practices) Rules, 2011.
          </p>
          <p className="mt-2">
            Access to your personal data is restricted to R Creation personnel who require it for order fulfilment or
            customer support. We do not grant third-party access to raw customer data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">6. Data Retention</h2>
          <p>We retain your personal data for as long as necessary to fulfil the purposes described in this policy:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Order &amp; transaction records:</strong> 7 years (as required by Indian tax law)</li>
            <li><strong>Customer account data:</strong> Until account deletion is requested</li>
            <li><strong>Inquiry / contact form data:</strong> 2 years from date of last contact</li>
            <li><strong>Analytics data (Google Analytics):</strong> 14 months (configured in our GA4 property)</li>
            <li><strong>Cookie consent records:</strong> 1 year</li>
          </ul>
          <p className="mt-2">
            After retention periods expire, data is securely deleted or anonymised so that it can no longer be linked
            to an individual.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">7. Cookies &amp; Analytics</h2>
          <p>
            We use cookies to operate our website and, with your consent, to understand how visitors interact with it.
            Analytics cookies (Google Analytics 4) are only activated after you click &ldquo;Accept All&rdquo; or enable Analytics
            in our cookie preference manager.
          </p>
          <p className="mt-2">
            For a full list of cookies, their purpose, and duration — and to manage your preferences — please read our{' '}
            <Link href="/cookies" className="text-accent hover:underline">Cookie Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">8. Third-Party Services</h2>
          <p>We use the following third-party services which may process your data under their own privacy policies:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>Google Analytics 4</strong> (Google LLC) — website analytics.{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google Privacy Policy</a>
            </li>
            <li>
              <strong>Supabase Inc.</strong> — database, authentication, and storage infrastructure.{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Supabase Privacy Policy</a>
            </li>
            <li>
              <strong>WhatsApp Business</strong> (Meta Platforms Inc.) — customer messaging. When you click a WhatsApp
              link on our site, your interaction is governed by{' '}
              <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">WhatsApp&rsquo;s Privacy Policy</a>.
              We do not control how WhatsApp or Meta processes your data.
            </li>
            <li>
              <strong>Vercel Inc.</strong> — website hosting and CDN. Edge request logs (including IP addresses) may
              be retained for up to 30 days for security purposes.{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Vercel Privacy Policy</a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">9. Children&rsquo;s Privacy</h2>
          <p>
            Our website and services are not directed at children under the age of 18. We do not knowingly collect
            personal data from minors. If you believe a child has provided personal data to us, please contact us
            immediately at <a href="mailto:rcreationsstudio@gmail.com" className="text-accent hover:underline">rcreationsstudio@gmail.com</a> and
            we will take prompt steps to delete it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">10. Your Rights (DPDPA 2023)</h2>
          <p>Under India&rsquo;s Digital Personal Data Protection Act, 2023, you have the following rights:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Right of access:</strong> Request a summary of personal data we hold about you</li>
            <li><strong>Right to correction:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong>Right to erasure:</strong> Request deletion of your personal data (subject to legal retention obligations)</li>
            <li><strong>Right to grievance redressal:</strong> Lodge a complaint with us or with the Data Protection Board of India</li>
            <li><strong>Right to withdraw consent:</strong> Withdraw previously given consent at any time (this does not affect processing carried out before withdrawal)</li>
            <li><strong>Right to nominate:</strong> Nominate another individual to exercise your rights in the event of your death or incapacity</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, email us at{' '}
            <a href="mailto:rcreationsstudio@gmail.com" className="text-accent hover:underline">rcreationsstudio@gmail.com</a>.
            We will acknowledge your request within 7 days and respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or
            applicable law. When we make material changes, we will update the &ldquo;Last updated&rdquo; date at the top of this page.
            We encourage you to review this policy periodically. Continued use of our website after updates constitutes
            acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">12. Contact &amp; Grievance Officer</h2>
          <p>
            For privacy-related inquiries, data requests, or to lodge a grievance, contact our designated officer at:<br />
            <strong>R Creation</strong>, Gudiyattam, Vellore District, Tamil Nadu — 632602<br />
            Phone: <a href="tel:+918754940610" className="text-accent hover:underline">+91 87549 40610</a><br />
            Email: <a href="mailto:rcreationsstudio@gmail.com" className="text-accent hover:underline">rcreationsstudio@gmail.com</a>
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            If you are not satisfied with our response, you may escalate your grievance to the{' '}
            <a href="https://dpboard.gov.in" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Data Protection Board of India
            </a>
            .
          </p>
        </section>

      </div>
    </div>
  );
}
