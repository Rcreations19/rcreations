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
    'From single personalized gifts to bulk wholesale orders — wooden trophies, photo frames and mementos crafted in Gudiyattam. Retail or wholesale, we bring your memories to life.',
  socialProof: 'Retail & Wholesale · Gifts · Frames · Mementos',
  images: [
    '/images/products/hero_couple_frame.png',
    '/images/products/hero_custom_trophies.png',
    '/images/products/hero_custom_totebag.png',
  ],
  imageAlts: ['Custom Gifts', 'Wooden Mementos', 'Photo Frames'],
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
    text: 'Shop Retail & Wholesale →',
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-[#0a0e27]/60 tracking-wide mb-8">Trusted by 500+ Studios & Retailers</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-60 hover:opacity-100 transition-opacity duration-500">
            {['Vellore Trophy House', 'Selvam Photo Studio', 'Rotary Club Gudiyattam', 'Lions Club Vellore', 'Tamil Nadu Police'].map((partner, i) => (
              <span key={i} className="text-sm font-bold font-heading text-[#0a0e27] uppercase tracking-wider">{partner}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== MANUFACTURING EXCELLENCE (SLIDER) ==================== */}
      <InfiniteSlider />

      {/* ==================== B2B VS B2C ==================== */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Retail Block (Prioritized) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="glass-panel-dark p-10 lg:p-14 rounded-[2.5rem] border-2 border-[#2aabb0]/50 shadow-[0_0_30px_rgba(42,171,176,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#2aabb0]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <User className="w-12 h-12 text-[#2aabb0] mb-8 relative z-10" />
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-6 relative z-10">Retail Customers</h2>
              <p className="text-base text-neutral-300 mb-10 leading-relaxed font-medium relative z-10">
                Design the perfect custom gift or premium photo frame for your home using our interactive online configurator. Order single units with no minimums, crafted with the same industrial precision.
              </p>
              <ul className="space-y-5 mb-12 text-sm font-medium text-neutral-200 relative z-10">
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-[#2aabb0]/20"><Check className="w-4 h-4 text-[#2aabb0]" /></div> Interactive frame builder</li>
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-[#2aabb0]/20"><Check className="w-4 h-4 text-[#2aabb0]" /></div> No minimum order</li>
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-[#2aabb0]/20"><Check className="w-4 h-4 text-[#2aabb0]" /></div> Fast 3-day production</li>
              </ul>
              <Link href="/products" className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-[#2aabb0] text-[#0a0e27] text-sm font-bold tracking-wide rounded-xl hover:bg-[#38C8CC] transition-colors shadow-[0_0_20px_rgba(56,200,204,0.2)] relative z-10">
                Shop Now
              </Link>
            </motion.div>

            {/* Wholesale Block (Secondary) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-panel p-10 lg:p-14 rounded-[2.5rem] border border-white/40 bg-white/40"
            >
              <Building2 className="w-12 h-12 text-[#0a0e27] mb-8" />
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0a0e27] tracking-tight mb-6">Wholesale Partners</h2>
              <p className="text-base text-[#0a0e27]/80 mb-10 leading-relaxed font-medium">
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
