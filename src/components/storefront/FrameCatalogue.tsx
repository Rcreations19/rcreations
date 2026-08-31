import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Layers, Palette } from 'lucide-react';
import { createPublicClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';

const getActiveFrameOptions = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('frame_options')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    return data || [];
  },
  ['frame-options-public'],
  { revalidate: 3600, tags: ['frame_options'] }
);

export async function FrameCatalogue() {
  const activeOptions = await getActiveFrameOptions();

  if (activeOptions.length === 0) {
    return null;
  }

  // Group by category to show variety
  const categories = Array.from(new Set(activeOptions.map((opt) => opt.category)));

  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold font-mono tracking-widest text-cyan-accent uppercase mb-3 bg-cyan-accent/10 px-3 py-1 rounded-full">
              <Layers className="w-3.5 h-3.5" /> Premium Materials
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-primary tracking-tight mb-4">
              Explore Frame Varieties
            </h2>
            <p className="text-sm md:text-base text-neutral-600">
              From classic wooden moldings to modern industrial metals and acrylics. Discover our factory-direct materials, available for custom sizing.
            </p>
          </div>
          <Link href="/configurator" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white text-sm font-bold tracking-wide rounded-xl hover:bg-primary/90 transition-all shadow-md shrink-0 group">
            Open Custom Builder
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {categories.map((category) => {
            // Get the first couple of options for this category
            const categoryOptions = activeOptions.filter(opt => opt.category === category);
            // Select one with an image if possible to feature it
            const featuredOption = categoryOptions.find(opt => opt.image_url) || categoryOptions[0];

            return (
              <Link 
                href="/configurator" 
                key={category}
                className="group glass-panel rounded-3xl overflow-hidden border border-neutral-200 bg-surface shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-100 p-8 flex items-center justify-center">
                  {featuredOption.image_url ? (
                    <Image 
                      src={featuredOption.image_url} 
                      alt={featuredOption.name} 
                      fill 
                      sizes="(max-width: 768px) calc(100vw - 2rem), (max-width: 1280px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl border-4 border-white shadow-lg flex items-center justify-center" style={{ backgroundColor: featuredOption.color_hex || '#e5e5e5' }}>
                      <Palette className="w-12 h-12 text-white/50 mix-blend-overlay" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary">
                    {category}
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-lg font-extrabold text-primary tracking-tight mb-2 group-hover:text-cyan-accent transition-colors">
                    {featuredOption.name}
                  </h3>
                  {featuredOption.description && (
                    <p className="text-xs text-neutral-500 line-clamp-2 mb-4 flex-grow">
                      {featuredOption.description}
                    </p>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Available Colors</p>
                    <div className="flex flex-wrap gap-1.5">
                      {categoryOptions.slice(0, 5).map((opt) => (
                        <div 
                          key={opt.id}
                          className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: opt.color_hex || '#000' }}
                          title={opt.color_name || opt.name}
                        />
                      ))}
                      {categoryOptions.length > 5 && (
                        <div className="w-5 h-5 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[8px] font-bold text-neutral-500">
                          +{categoryOptions.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
