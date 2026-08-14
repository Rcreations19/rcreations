'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Building2, User } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { Hero10, type Hero10Props } from '@/components/ui/hero-10';
import { InfiniteSlider } from '@/components/ui/infinite-slider';

const heroValues = {
  title: 'Give Life to Your Memories',
  titleLine2Prefix: 'at',
  titleHighlight: 'R Creation',
  description:
    'Factory-direct photo frames, crystal trophies, and custom gifts from Gudiyattam. Retail or wholesale, crafted with industrial precision.',
  socialProof: 'Retail & Wholesale · Since 2015 · Gudiyattam',
  images: [
    '/images/products/hero_couple_frame.png',
    '/images/products/hero_custom_trophies.png',
    '/images/products/hero_custom_totebag.png',
  ],
  imageAlts: ['Custom Photo Frame', 'Crystal Trophy', 'Personalized Gift'],
  animation: 'subtle',
  primaryCTA: {
    ctaEnabled: true,
    text: 'Get Best Quote',
    link: '/products',
    variant: 'default',
    size: 'default',
  },
  secondaryCTA: {
    ctaEnabled: true,
    text: 'Shop Catalog',
    link: '/products',
    variant: 'outline',
    size: 'default',
  },
} satisfies Hero10Props;

export default function HomePageClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-transparent overflow-hidden">
      
      {/* ==================== HERO SECTION ==================== */}
      <Hero10 {...heroValues} />

      {/* ==================== TRUST BANNER ==================== */}
      <section className="py-12 glass-panel border-y border-white/40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-[#0a0e27]/60 tracking-wide mb-8">Trusted by 500+ Studios & Retailers Across Tamil Nadu</p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-500">
            {['Vellore Trophy House', 'Selvam Photo Studio', 'Rotary Club Gudiyattam', 'Lions Club Vellore', 'Tamil Nadu Police'].map((partner, i) => (
              <span key={i} className="text-xs md:text-sm font-bold font-heading text-[#0a0e27] uppercase tracking-wider whitespace-nowrap">{partner}</span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 mt-8 pt-8 border-t border-[#0a0e27]/10">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0a0e27]/50 uppercase tracking-wider">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
              GST Registered
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0a0e27]/50 uppercase tracking-wider">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              Secure Packaging
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0a0e27]/50 uppercase tracking-wider">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              Local Delivery (40km Radius)
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MANUFACTURING EXCELLENCE (SLIDER) ==================== */}
      <InfiniteSlider />

      {/* ==================== B2B VS B2C ==================== */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Retail Block (Prioritized) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="glass-panel-dark p-6 md:p-10 lg:p-14 rounded-[2rem] lg:rounded-[2.5rem] border-2 border-[#2aabb0]/50 shadow-[0_0_30px_rgba(200,147,58,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#2aabb0]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <User className="w-10 h-10 md:w-12 md:h-12 text-[#2aabb0] mb-6 md:mb-8 relative z-10" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-4 md:mb-6 relative z-10">Retail Customers</h2>
              <p className="text-sm md:text-base text-neutral-300 mb-8 md:mb-10 leading-relaxed font-medium relative z-10">
                Design the perfect custom gift or premium photo frame for your home using our interactive online configurator. Order single units with no minimums, crafted with the same industrial precision.
              </p>
              <ul className="space-y-5 mb-12 text-sm font-medium text-neutral-200 relative z-10">
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-[#2aabb0]/20"><Check className="w-4 h-4 text-[#2aabb0]" /></div> Interactive frame builder</li>
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-[#2aabb0]/20"><Check className="w-4 h-4 text-[#2aabb0]" /></div> No minimum order</li>
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-[#2aabb0]/20"><Check className="w-4 h-4 text-[#2aabb0]" /></div> Fast 3-day production</li>
              </ul>
              <Link href="/products" className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-[#2aabb0] text-[#0a0e27] text-sm font-bold tracking-wide rounded-xl hover:bg-[#38C8CC] transition-colors shadow-[0_0_20px_rgba(200,147,58,0.2)] relative z-10">
                Shop Now
              </Link>
            </motion.div>

            {/* Wholesale Block (Secondary) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-panel p-6 md:p-10 lg:p-14 rounded-[2rem] lg:rounded-[2.5rem] border border-white/40 bg-white/40"
            >
              <Building2 className="w-10 h-10 md:w-12 md:h-12 text-[#0a0e27] mb-6 md:mb-8" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#0a0e27] tracking-tight mb-4 md:mb-6">Wholesale Partners</h2>
              <p className="text-sm md:text-base text-[#0a0e27]/80 mb-8 md:mb-10 leading-relaxed font-medium">
                Ideal for photo studios, corporate event organizers, and gift shops. Access our factory-direct pricing with a minimum order quantity (MOQ) of just 10 units. We provide full GST tax invoices and handle regional logistics.
              </p>
              <ul className="space-y-5 mb-12 text-sm font-medium text-[#0a0e27]/90">
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-[#0a0e27]/10"><Check className="w-4 h-4 text-[#0a0e27]" /></div> Up to 45% off retail pricing</li>
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-[#0a0e27]/10"><Check className="w-4 h-4 text-[#0a0e27]" /></div> Dedicated account manager</li>
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-[#0a0e27]/10"><Check className="w-4 h-4 text-[#0a0e27]" /></div> Custom laser engraving included</li>
              </ul>
              <Link href="/wholesale" className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-[#0a0e27] text-[#0a0e27] text-sm font-bold tracking-wide rounded-xl hover:bg-[#0a0e27] hover:text-white transition-all">
                Apply for Wholesale
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== SERVER COMPONENTS (e.g. Google Reviews) ==================== */}
      {children}
    </div>
  );
}
