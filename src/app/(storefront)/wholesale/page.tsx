'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Receipt, ShieldCheck, ChevronDown, ArrowRight, Percent, Building2, PhoneCall, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const benefits = [
  { icon: Percent,      title: 'High Retail Margins',      desc: 'Enjoy 30–45% volume discounts off retail catalog pricing to maximise store profitability.' },
  { icon: Receipt,      title: 'GST B2B Invoicing',        desc: 'Full GST compliance with proper input tax credit eligibility on every order.' },
  { icon: Package,      title: 'Low MOQ — 10 Units',       desc: 'Accessible minimums reduce inventory risk and let you test new product lines easily.' },
  { icon: ShieldCheck,  title: 'Factory QC Guarantee',     desc: 'Every batch passes strict quality control before it leaves Gudiyattam.' },
];

const steps = [
  { n: '01', title: 'Inquiry & Requirements',       desc: 'Submit via WhatsApp or our contact form. Tell us the products, quantities, and any custom-engraving needs.' },
  { n: '02', title: 'Proforma Invoice & Pricing',   desc: 'We send a full proforma with wholesale discounts, estimated freight, and GST breakdown.' },
  { n: '03', title: 'Confirmation & Payment',       desc: 'Approve the proforma, remit via NEFT/RTGS. 3D digital proofs provided for custom items.' },
  { n: '04', title: 'Production & Dispatch',        desc: 'Manufactured, QC-tested, securely packed, and dispatched with freight tracking details.' },
];

const faqs = [
  { q: 'What is the Minimum Order Quantity (MOQ)?',     a: 'Our standard wholesale MOQ is 10 units for most product categories. Large custom institutional orders may vary — please check individual specs.' },
  { q: 'Do you provide GST tax invoices?',              a: 'Yes. Every wholesale order ships with a standard B2B GST tax invoice. Provide your GSTIN during order confirmation to claim full input tax credit.' },
  { q: 'How is shipping handled for wholesale orders?', a: 'Delivery is limited to Vellore, Gudiyattam, and surrounding areas within a 40km radius. We use our own direct transport for these local deliveries. Costs are volume-based.' },
  { q: 'What is the typical production lead time?',     a: 'Standard catalog items dispatch within 1–3 business days. Custom engraved or built-to-order items: 3–5 days, depending on batch size.' },
];

export default function WholesalePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-white min-h-screen selection:bg-accent/20">

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="space-y-8"
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/40 bg-accent/8 text-accent text-[10px] font-extrabold uppercase tracking-widest font-mono">
                <Building2 className="w-3.5 h-3.5" />
                Premium B2B Partner Programme
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-[#10164A] leading-[1.08] tracking-tight">
                Wholesale Sourcing,{' '}
                <span className="text-accent">Elevated.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl font-medium">
                Partner with R Creation Gudiyattam for factory-direct access to luxury photo frames, trophies, and custom gifts. Maximise retail margins with unmatched volume pricing.
              </p>

              <ul className="space-y-3">
                {['Factory-direct prices — no middlemen', 'MOQ as low as 10 units', 'Full GST B2B invoicing included'].map((pt) => (
                  <li key={pt} className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="/contact"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-accent hover:bg-[#10164A] text-white rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all duration-300 shadow-[0_4px_20px_rgba(42,171,176,0.35)] hover:shadow-[0_4px_20px_rgba(16,22,74,0.35)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  Request Rate Card
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-[#10164A]/20 hover:border-[#10164A] text-[#10164A] rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all duration-300 hover:bg-[#10164A]/5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  View Bulk Catalogue
                </Link>
              </div>
            </motion.div>

            {/* Right: image */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
              className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_60px_-10px_rgba(16,22,74,0.15)] ring-1 ring-black/5"
            >
              <Image
                src="/images/premium_factory_hero.png"
                alt="R Creation factory — luxury photo frame production"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-[2.5s] ease-out"
              />
              {/* Subtle tint overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#10164A]/20 to-transparent" />

              {/* Floating stat badge */}
              <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-white/50 flex items-center gap-3">
                <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Percent className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Volume Discount</p>
                  <p className="text-sm font-black text-[#10164A] tabular">Up to 45% Off Retail</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── WHY SOURCE ────────────────────────────────────────────────────── */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-accent font-mono">Our Advantages</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#10164A] tracking-tight">Why Source from R Creation?</h2>
            <p className="text-slate-500 text-base leading-relaxed">Built for photo studios, gift boutiques, and large-scale corporate procurement.</p>
          </div>

          {/* Featured benefit spans two columns for visual rhythm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
            {benefits.map((b, i) => {
              // First card takes wider span on lg, breaks the generic 4-equal-column grid
              const featured = i === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`group relative overflow-hidden bg-white border border-slate-100 hover:border-accent/40 rounded-2xl p-7 shadow-sm hover:shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-accent/60 ${
                    featured ? 'lg:col-span-3' : 'lg:col-span-3'
                  }`}
                >
                  {featured && (
                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/8 blur-3xl" />
                  )}
                  <div className="relative flex items-start gap-5">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent transition-colors duration-300 shrink-0 group-focus-visible:scale-110">
                      <b.icon className="w-6 h-6 text-accent group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-[#10164A] mb-2">{b.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── PROCESS + FAQ ─────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-100 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28">

            {/* Process */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-accent font-mono mb-3">How It Works</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[#10164A] mb-12 tracking-tight">Wholesale Order Process</h2>

              <div className="relative">
                {/* vertical track */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />

                <div className="space-y-10">
                  {steps.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-6 relative group"
                    >
                      {/* Node */}
                      <div className="relative z-10 w-10 h-10 rounded-full bg-white border-2 border-slate-200 group-hover:border-accent group-hover:bg-accent flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm">
                        <span className="text-[10px] font-extrabold text-slate-400 group-hover:text-white font-mono transition-colors">{s.n}</span>
                      </div>

                      {/* Content */}
                      <div className="pb-2 pt-1">
                        <h3 className="text-sm font-extrabold text-[#10164A] mb-1.5 group-hover:text-accent transition-colors">{s.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA strip */}
              <div className="mt-12 flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-[#10164A]">Ready to get started?</p>
                  <p className="text-xs text-slate-500 mt-0.5">Request our wholesale catalogue today.</p>
                </div>
                <Link
                  href="/contact"
                  className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 bg-accent hover:bg-[#10164A] text-white rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-300"
                >
                  Contact Us <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-accent font-mono mb-3">Quick Answers</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[#10164A] mb-12 tracking-tight">Frequently Asked Questions</h2>

              <div className="divide-y divide-slate-100 border-y border-slate-100">
                {faqs.map((faq, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      aria-expanded={openFaq === i}
                      className="w-full flex items-start justify-between gap-4 py-5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 rounded"
                    >
                      <span className={`text-sm font-bold leading-snug transition-colors duration-200 ${openFaq === i ? 'text-accent' : 'text-[#10164A] group-hover:text-accent'}`}>
                        {faq.q}
                      </span>
                      <ChevronDown className={`w-5 h-5 shrink-0 mt-0.5 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-accent' : 'text-slate-400'}`} />
                    </button>

                    <AnimatePresence initial={false}>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="pb-5 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Still have questions */}
              <div className="mt-10 p-6 rounded-2xl bg-[#10164A] relative overflow-hidden flex items-center justify-between gap-4">
                <div className="noise-overlay" aria-hidden />
                <div className="relative z-10">
                  <p className="text-sm font-extrabold text-white">Still have questions?</p>
                  <p className="text-xs text-slate-300 mt-0.5">Our wholesale team replies within 2 hours.</p>
                </div>
                <Link
                  href="/contact"
                  aria-label="Contact wholesale team"
                  className="relative z-10 shrink-0 w-11 h-11 rounded-full bg-accent hover:bg-white flex items-center justify-center text-[#10164A] active:scale-95 shadow-[0_0_16px_rgba(42,171,176,0.5)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#10164A]"
                >
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
