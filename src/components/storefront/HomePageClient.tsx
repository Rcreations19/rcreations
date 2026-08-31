'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Building2, User, Target, Eye, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Hero10, type Hero10Props } from '@/components/ui/hero-10';
import dynamic from 'next/dynamic';

const InfiniteSlider = dynamic(() => import('@/components/ui/infinite-slider').then(mod => mod.InfiniteSlider), { ssr: false });

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  cover_image_url: string | null;
  created_at: string;
}

interface HomePageClientProps {
  children: React.ReactNode;
  latestBlogs?: BlogPost[];
  topSellers: React.ReactNode;
  frameCatalogue?: React.ReactNode;
  businessTestimonials?: React.ReactNode;
}

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
    link: '/configurator',
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

export default function HomePageClient({ children, latestBlogs = [], topSellers, frameCatalogue, businessTestimonials }: HomePageClientProps) {
  return (
    <div className="bg-transparent overflow-hidden">

      {/* ==================== HERO SECTION ==================== */}
      <Hero10 {...heroValues} />

      {/* ==================== TRUST BANNER ==================== */}
      <section className="py-12 md:py-24 glass-panel border-y border-neutral-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-primary/50 uppercase tracking-wider">
              <svg className="w-4 h-4 text-gold-accent" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
              GST Registered
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary/50 uppercase tracking-wider">
              <svg className="w-4 h-4 text-cyan-accent" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              Secure Packaging
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary/50 uppercase tracking-wider">
              <svg className="w-4 h-4 text-gold-accent" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              Local Delivery (40km Radius)
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MISSION & VISION ==================== */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">

            {/* Mission Panel (Dark - 2/5 width) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-panel-dark p-8 md:p-12 lg:col-span-2 rounded-3xl lg:rounded-[2rem] border border-accent/20 relative overflow-hidden flex flex-col"
            >
              <div className="noise-overlay" aria-hidden />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/8 rounded-full blur-3xl -mr-16 -mb-16" />
              <Target className="w-8 h-8 md:w-10 md:h-10 text-accent mb-6 relative z-10" />
              <span className="text-xs uppercase tracking-widest text-accent font-semibold mb-3 relative z-10">Our Mission</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-4 relative z-10">Expand Across Tamil Nadu</h2>
              <p className="text-sm md:text-base text-neutral-300 leading-relaxed font-medium relative z-10 text-balance">
                To grow R Creation into Tamil Nadu&apos;s most recognised frame and memento brand — reaching every district, serving local studios, retailers, and institutions with factory-direct quality and personal care.
              </p>
            </motion.div>

            {/* Vision Panel (Light - 3/5 width) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="glass-panel p-8 md:p-12 lg:col-span-3 rounded-3xl lg:rounded-[2rem] border border-neutral-200 bg-white flex flex-col shadow-[var(--shadow-soft)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20" />
              <Eye className="w-8 h-8 md:w-10 md:h-10 text-primary mb-6 relative z-10" />
              <span className="text-xs uppercase tracking-widest text-primary/50 font-semibold mb-3 relative z-10">Our Vision</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight mb-4 relative z-10">Providing to 50+ Families in This Industry</h2>
              <p className="text-sm md:text-base text-primary/80 leading-relaxed font-medium relative z-10 text-balance mb-8">
                Already trusted by over 50 families, studios, and businesses across the region — R Creation continues to grow as the go-to source for premium photo frames, crystal trophies, and custom mementos. Every piece we craft carries the same commitment to quality that made those 50+ relationships last.
              </p>
              <ul className="space-y-4 mt-auto relative z-10">
                <li className="flex items-center gap-3 text-sm font-medium text-primary/70">
                  <div className="p-1 rounded-full bg-gold-accent/10"><Sparkles className="w-4 h-4 text-gold-accent" /></div>
                  50+ families and studios already trust us
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-primary/70">
                  <div className="p-1 rounded-full bg-gold-accent/10"><Sparkles className="w-4 h-4 text-gold-accent" /></div>
                  Expanding to every corner of Tamil Nadu
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== MANUFACTURING EXCELLENCE (SLIDER) ==================== */}
      <InfiniteSlider />

      {/* ==================== B2B VS B2C ==================== */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-stretch">

            {/* Retail Block (Prioritized) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="glass-panel-dark p-6 md:p-10 lg:p-14 rounded-3xl lg:rounded-[2rem] border-2 border-gold-accent/40 shadow-[var(--shadow-gold-glow)] relative overflow-hidden flex flex-col"
            >
              <div className="noise-overlay" aria-hidden />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold-accent/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <User className="w-10 h-10 md:w-12 md:h-12 text-gold-accent mb-6 md:mb-8 relative z-10" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-4 md:mb-6 relative z-10">Retail Customers</h2>
              <p className="text-sm md:text-base text-neutral-300 mb-8 md:mb-10 leading-relaxed font-medium relative z-10 text-balance">
                Design the perfect custom gift or premium photo frame for your home using our interactive online configurator. Order single units with no minimums, crafted with the same industrial precision.
              </p>
              <ul className="space-y-5 mb-12 text-sm font-medium text-neutral-200 relative z-10">
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-gold-accent/20"><Check className="w-4 h-4 text-gold-accent" /></div> Interactive frame builder</li>
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-gold-accent/20"><Check className="w-4 h-4 text-gold-accent" /></div> No minimum order</li>
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-gold-accent/20"><Check className="w-4 h-4 text-gold-accent" /></div> Fast 3-day production</li>
              </ul>
              <Link href="/products" className="mt-auto inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gold-accent text-primary text-sm font-bold tracking-wide rounded-xl hover:bg-gold-hover active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(250,195,76,0.35)] relative z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Shop Now
              </Link>
            </motion.div>

            {/* Wholesale Block (Secondary) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-panel p-6 md:p-10 lg:p-14 rounded-3xl lg:rounded-[2rem] border border-neutral-200 bg-white flex flex-col shadow-[var(--shadow-soft)]"
            >
              <Building2 className="w-10 h-10 md:w-12 md:h-12 text-primary mb-6 md:mb-8" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight mb-4 md:mb-6">Wholesale Partners</h2>
              <p className="text-sm md:text-base text-primary/80 mb-8 md:mb-10 leading-relaxed font-medium text-balance">
                Ideal for photo studios, corporate event organizers, and gift shops. Access our factory-direct pricing with a minimum order quantity (MOQ) of just 10 units. We provide full GST tax invoices and handle regional logistics.
              </p>
              <ul className="space-y-5 mb-12 text-sm font-medium text-primary/90">
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-cyan-accent/10"><Check className="w-4 h-4 text-cyan-accent" /></div> Up to 45% off retail pricing</li>
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-cyan-accent/10"><Check className="w-4 h-4 text-cyan-accent" /></div> Dedicated account manager</li>
                <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-cyan-accent/10"><Check className="w-4 h-4 text-cyan-accent" /></div> Custom laser engraving included</li>
              </ul>
              <Link href="/wholesale" className="mt-auto inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-primary border-2 border-primary text-white text-sm font-bold tracking-wide rounded-xl hover:bg-[#1c246e] hover:border-[#1c246e] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-md hover:shadow-lg">
                Apply for Wholesale
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== SERVER COMPONENTS ====================
           Rendered in page.tsx (server context) and passed as props/children:
           1. frameCatalogue — photo frame varieties catalog
           2. topSellers  — bestseller product grid
           3. businessTestimonials — B2B testimonials
           4. {children}  — <GoogleReviews /> testimonials
      ====================================================== */}
      {frameCatalogue}
      
      {topSellers}
      
      {businessTestimonials}

      {/* ==================== LATEST FROM BLOG ==================== */}
      {latestBlogs.length > 0 && (
        <section className="py-12 md:py-24 relative overflow-hidden">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-end justify-between mb-10 md:mb-14">
              <div>
                <span className="text-xs uppercase tracking-widest text-accent font-semibold block mb-3">From Our Blog</span>
                <h2 className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight">Latest Insights</h2>
              </div>
              <Link href="/blogs" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-primary/60 hover:text-accent transition-colors group">
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestBlogs.map((blog, i) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link href={`/blogs/${blog.slug}`} className="group block glass-panel rounded-3xl overflow-hidden border border-neutral-200 bg-white shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 h-full">
                    {blog.cover_image_url ? (
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={blog.cover_image_url}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-gradient-to-br from-[#01063B] to-[#10164A] flex items-center justify-center">
                        <span className="text-4xl font-serif-heading text-white/20">{blog.title.charAt(0)}</span>
                      </div>
                    )}
                    <div className="p-6 md:p-8">
                      <div className="flex items-center gap-2 text-xs font-medium text-primary/40 mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <h3 className="text-lg font-extrabold text-primary tracking-tight mb-2 group-hover:text-accent transition-colors line-clamp-2">{blog.title}</h3>
                      {blog.summary && (
                        <p className="text-sm text-primary/60 leading-relaxed line-clamp-2">{blog.summary}</p>
                      )}
                      <span className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-accent uppercase tracking-wider group-hover:gap-2.5 transition-all">
                        Read Article
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <Link href="/blogs" className="sm:hidden inline-flex items-center gap-2 mt-8 text-sm font-bold text-primary/60 hover:text-accent transition-colors group">
              View All Articles
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}

      {/* Local SEO Block */}
      <section className="py-12 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 tracking-tight">Proudly Serving Vellore District</h2>
            <p className="text-primary/70 leading-relaxed text-sm md:text-base">
              R Creation is the premier manufacturer of wholesale synthetic photo frames, optic crystal trophies, and wooden mementos. We offer factory-direct pricing and fast delivery to studios, schools, and corporate events across <strong>Gudiyattam, Vellore, Ranipet, Ambur, and Vaniyambadi</strong>. Skip the middlemen and buy directly from the source.
            </p>
          </div>
        </div>
      </section>

      {children}
    </div>
  );
}
