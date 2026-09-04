import React from 'react';
import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import FrameThumbnail from './FrameThumbnail';

const SHOWCASE_FRAMES = [
  {
    id: 'f10',
    category: 'acrylic', // White
    name: 'Glossy White Premium Frame',
    description: 'Minimalist white profile, perfect for modern gallery walls and contemporary photography.',
    color_hex: '#ffffff',
  },
  {
    id: 'f2',
    category: 'fibre',
    name: 'Ornate Antique Gold Fibre',
    description: 'High-density synthetic fibre with a vintage gold finish, offering the premium look of traditional carved wood.',
    color_hex: '#D4AF37',
  },
  {
    id: 'f21',
    category: 'fibre',
    name: 'Gold Accent Brown Fibre',
    description: 'Durable synthetic fibre frame featuring a rich brown outer profile with an elegant inner gold accent.',
    color_hex: '#3E2723',
  },
  {
    id: 'f1',
    category: 'fibre',
    name: 'Classic Teak Wood Texture',
    description: 'Premium fibre molding wrapped in a highly realistic polished teak wood texture for a timeless aesthetic.',
    color_hex: '#5C4033',
  }
];

export async function FrameCatalogue() {
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
              From classic wood-textured synthetic fibre to modern ornate gold finishes. Discover our factory-direct high-density fibre materials, available for custom sizing.
            </p>
          </div>
          <Link href="/configurator" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white text-sm font-bold tracking-wide rounded-xl hover:bg-primary/90 transition-all shadow-md shrink-0 group">
            Open Custom Builder
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {SHOWCASE_FRAMES.map((frame) => (
            <Link 
              href="/configurator" 
              key={frame.id}
              className="group glass-panel rounded-3xl overflow-hidden border border-neutral-200 bg-surface shadow-[var(--shadow-soft)] hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* 3D Auto-Rotating Thumbnail */}
              <div className="relative aspect-square overflow-hidden bg-neutral-100 flex items-center justify-center p-0">
                <FrameThumbnail 
                  materialId={frame.id} 
                  category={frame.category} 
                  fallbackColor={frame.color_hex} 
                />
              </div>
              
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-lg font-extrabold text-primary tracking-tight mb-2 group-hover:text-cyan-accent transition-colors">
                  {frame.name}
                </h3>
                <p className="text-xs text-neutral-500 line-clamp-3 mb-4 flex-grow">
                  {frame.description}
                </p>
                
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Available Colors</p>
                  <div className="flex flex-wrap gap-1.5">
                    <div 
                      className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: frame.color_hex }}
                    />
                    <div className="w-5 h-5 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[8px] font-bold text-neutral-500">
                      +
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
