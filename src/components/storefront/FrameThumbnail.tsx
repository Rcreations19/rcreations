'use client';

import React, { useRef } from 'react';
import { useInView } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Palette } from 'lucide-react';

const ThreeDFrameViewer = dynamic(() => import('@/components/storefront/ThreeDFrameViewer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-100">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  )
});

interface FrameThumbnailProps {
  materialId: string;
  category: string;
  fallbackColor?: string;
}

export default function FrameThumbnail({ materialId, category, fallbackColor }: FrameThumbnailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "200px" });

  return (
    <div ref={ref} className="relative aspect-square w-full h-full overflow-hidden bg-neutral-100 flex items-center justify-center">
      {isInView ? (
        <ThreeDFrameViewer 
          materialId={materialId}
          widthCm={20}
          heightCm={20}
          thicknessCm={3}
          isThumbnail={true}
        />
      ) : (
        <div className="w-full h-full rounded-xl border-4 border-white shadow-lg flex items-center justify-center" style={{ backgroundColor: fallbackColor || '#e5e5e5' }}>
          <Palette className="w-12 h-12 text-white/50 mix-blend-overlay" />
        </div>
      )}
      
      {/* Category overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary z-10 shadow-sm pointer-events-none">
        {category}
      </div>
    </div>
  );
}
