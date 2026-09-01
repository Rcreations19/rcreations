import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie policy for R Creation — what cookies we use, why, and how you can manage them.',
  alternates: {
    canonical: '/cookies',
  },
};

const cookies = [
  {
    name: '_ga',
    type: 'Analytics',
    provider: 'Google Analytics',
    purpose: 'Distinguishes unique users. Used to calculate visitor, session, and campaign data.',
    duration: '2 years',
  },
  {
    name: '_ga_*',
    type: 'Analytics',
    provider: 'Google Analytics',
    purpose: 'Persists session state specific to your GA4 property (G-FJSLXW6598).',
    duration: '2 years',
  },
  {
    name: 'rc_cookie_consent',
    type: 'Functional',
    provider: 'R Creation (First-party)',
    purpose: 'Stores your cookie preference (accepted / rejected / custom) so we do not ask again.',
    duration: '1 year',
  },
  {
    name: 'sb-*',
    type: 'Strictly Necessary',
    provider: 'Supabase / R Creation',
    purpose: 'Authentication session token. Required for secure account login and order management.',
    duration: 'Session',
  },
  {
    name: 'rc_cart',
    type: 'Functional',
    provider: 'R Creation (First-party)',
    purpose: 'Persists cart items across page navigations so your selections are not lost.',
    duration: '30 days',
  },
];

export default function CookiesPage() {
  return (
    <div className="pt-8 md:pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors mb-8">
        <ArrowLeft className="w-3 h-3" /> Back to Home
      </Link>

      <h1 className="text-3xl font-extrabold text-secondary tracking-tight mb-2">Cookie Policy</h1>
      <p className="text-xs text-neutral-500 font-mono mb-10">Last updated: September 2026</p>

      <div className="prose prose-sm prose-neutral max-w-none space-y-10 text-neutral-700 leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-secondary">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files placed on your device by websites you visit. They are widely used to make
            websites work, or work more efficiently, as well as to provide information to website owners. Cookies do
            not contain personally identifiable information by themselves; they act as identifiers that our servers
            can read when you return to our site.
          </p>
          <p className="mt-2">
            We use both <strong>session cookies</strong> (erased when you close your browser) and{' '}
            <strong>persistent cookies</strong> (remain on your device for a specified period or until you delete them).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">2. How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Strictly Necessary:</strong> Essential for the website to function (authentication, security).</li>
            <li><strong>Functional:</strong> Remember your preferences such as cart contents and cookie choices.</li>
            <li><strong>Analytics:</strong> Help us understand how visitors interact with our website so we can improve it. We use Google Analytics 4 with IP anonymisation enabled.</li>
          </ul>
          <p className="mt-3">
            We do <strong>not</strong> use advertising cookies, tracking pixels for third-party ad targeting, or any
            cookies that share your data with social media platforms for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">3. Cookies We Use</h2>
          <p className="mb-4">
            The table below lists every cookie placed by our website. Analytics cookies are only set after you give
            consent via our cookie banner.
          </p>

          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-left">
                  <th className="px-4 py-3 font-bold text-neutral-600 border-b border-neutral-200 whitespace-nowrap">Cookie Name</th>
                  <th className="px-4 py-3 font-bold text-neutral-600 border-b border-neutral-200">Type</th>
                  <th className="px-4 py-3 font-bold text-neutral-600 border-b border-neutral-200">Provider</th>
                  <th className="px-4 py-3 font-bold text-neutral-600 border-b border-neutral-200">Purpose</th>
                  <th className="px-4 py-3 font-bold text-neutral-600 border-b border-neutral-200 whitespace-nowrap">Duration</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c, i) => (
                  <tr key={c.name} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}>
                    <td className="px-4 py-3 font-mono text-neutral-800 border-b border-neutral-100 whitespace-nowrap align-top">{c.name}</td>
                    <td className="px-4 py-3 border-b border-neutral-100 align-top">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.type === 'Analytics'
                          ? 'bg-blue-50 text-blue-700'
                          : c.type === 'Functional'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600 border-b border-neutral-100 align-top whitespace-nowrap">{c.provider}</td>
                    <td className="px-4 py-3 text-neutral-600 border-b border-neutral-100 align-top">{c.purpose}</td>
                    <td className="px-4 py-3 font-mono text-neutral-600 border-b border-neutral-100 align-top whitespace-nowrap">{c.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">4. Your Consent Choices</h2>
          <p>
            When you first visit our website, a cookie banner will appear. You may choose to:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Accept All</strong> — enables analytics cookies in addition to strictly necessary and functional cookies.</li>
            <li><strong>Reject Non-Essential</strong> — only strictly necessary cookies are set; analytics are blocked.</li>
            <li><strong>Manage Preferences</strong> — toggle individual categories to suit your preference.</li>
          </ul>
          <p className="mt-3">
            Your preference is saved in the <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">rc_cookie_consent</code> cookie for one year.
            You can change your preference at any time by clearing your browser cookies, which will reset the banner.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">5. How to Manage Cookies in Your Browser</h2>
          <p>
            Most browsers allow you to refuse or delete cookies. The links below take you to the support pages for
            the most common browsers:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                Google Chrome
              </a>
            </li>
            <li>
              <a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                Apple Safari
              </a>
            </li>
            <li>
              <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                Microsoft Edge
              </a>
            </li>
          </ul>
          <p className="mt-3 text-neutral-500 text-xs">
            Note: Disabling strictly necessary cookies will affect core functionality such as login and cart.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">6. Opt Out of Google Analytics</h2>
          <p>
            You can prevent Google Analytics from collecting data about your visit across all websites by installing
            the official{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Google Analytics Opt-out Browser Add-on
            </a>
            . Alternatively, you can use our banner to reject analytics cookies whenever you visit our site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">7. Changes to This Cookie Policy</h2>
          <p>
            We may update this policy from time to time as we add or remove cookies. When we make significant changes,
            we will reset the consent banner so you can review and re-confirm your preferences. The &ldquo;Last updated&rdquo;
            date at the top of this page will always reflect the most recent revision.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-secondary">8. Contact Us</h2>
          <p>
            For cookie-related questions or to exercise your rights under India&rsquo;s Digital Personal Data Protection
            Act, 2023 (DPDPA), contact us at:<br />
            R Creation, Gudiyattam, Vellore District, Tamil Nadu — 632602<br />
            Phone: +91 87549 40610<br />
            Email:{' '}
            <a href="mailto:rcreationsstudio@gmail.com" className="text-accent hover:underline">
              rcreationsstudio@gmail.com
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
