import React from 'react';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ShieldCheck, Package, TrendingUp } from 'lucide-react';
import { BusinessTestimonials } from '@/components/storefront/BusinessTestimonials';
import { RoadmapTimeline, RoadmapMilestone } from '@/components/storefront/RoadmapTimeline';

export const metadata: Metadata = {
  title: 'About Us | R Creation',
  description: 'Learn about R Creation, Tamil Nadu’s premier wholesale framing and corporate gifting partner.',
};

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: settingsData } = await supabase.from('site_settings').select('*');
  
  const settings: Record<string, string> = {};
  if (settingsData) {
    settingsData.forEach(item => {
      settings[item.key] = (item.value as Record<string, string>)?.text || '';
    });
  }

  const heroTitle = settings.about_hero_title || 'Crafting Memories, Framing Legacies.';
  const heroSubtitle = settings.about_hero_subtitle || 'Tamil Nadu’s premier framing and corporate gifting partner.';
  const storyText = settings.about_story_text || 'R Creation began with a simple mission: to provide unparalleled quality in wholesale framing and corporate gifting. Over the years, we have grown into a trusted partner for hundreds of studios and businesses across Tamil Nadu, maintaining our commitment to craftsmanship, secure packaging, and unbeatable wholesale pricing.';

  let roadmapData: RoadmapMilestone[] = [];
  try {
    if (settings.about_roadmap) {
      roadmapData = JSON.parse(settings.about_roadmap);
    }
  } catch (e) {
    console.error("Failed to parse roadmap JSON on About page", e);
  }

  return (
    <div className="bg-transparent overflow-hidden">
      
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden border-b border-neutral-100">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-cyan-accent/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <span className="inline-block text-xs font-bold font-mono tracking-widest text-gold-accent uppercase bg-gold-accent/10 px-4 py-1.5 rounded-full">
              Our Story
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-extrabold text-primary tracking-tight leading-[1.1]">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              {heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* ==================== STORY SECTION ==================== */}
      <section className="py-20 lg:py-32 relative">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="glass-panel p-8 md:p-14 rounded-[2rem] border border-neutral-200 shadow-[var(--shadow-soft)] bg-white/90 relative">
              <QuoteIcon className="w-16 h-16 text-gold-accent/20 absolute -top-8 -left-8 pointer-events-none" />
              <div className="prose prose-lg md:prose-xl text-neutral-900 leading-relaxed font-medium">
                {storyText.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-6 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ROADMAP SECTION ==================== */}
      {roadmapData && roadmapData.length > 0 && (
        <section className="py-20 lg:py-32 relative bg-neutral-50/50">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold font-mono tracking-widest text-gold-accent uppercase mb-4 bg-gold-accent/10 px-4 py-1.5 rounded-full">
                Our Journey
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-primary tracking-tight">
                Milestones & Evolution
              </h2>
            </div>
            <RoadmapTimeline milestones={roadmapData} />
          </div>
        </section>
      )}

      {/* ==================== WHY CHOOSE US ==================== */}
      <section className="py-20 glass-panel border-y border-neutral-100 bg-white/40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-primary tracking-tight mb-4">
              The R Creation Standard
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              We don't just supply frames; we partner in your growth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Premium Quality"
              desc="Every frame is meticulously crafted using high-grade materials that stand the test of time."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="B2B Wholesale Pricing"
              desc="Unbeatable margins designed specifically for studios, corporate clients, and bulk retailers."
            />
            <FeatureCard 
              icon={<Package className="w-6 h-6" />}
              title="Secure Packaging"
              desc="Robust 3-layer protective packaging ensuring your glass frames arrive in pristine condition."
            />
          </div>
        </div>
      </section>

      {/* ==================== BEST CUSTOMERS MARQUEE ==================== */}
      <section className="pt-10 pb-20 lg:pt-16 lg:pb-32">
        <BusinessTestimonials />
      </section>

    </div>
  );
}

function QuoteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-neutral-100 shadow-[var(--shadow-soft)] hover:shadow-md transition-shadow group">
      <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-primary mb-3">{title}</h3>
      <p className="text-neutral-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
