'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const sliderImages = [
  '/images/slider/1.png',
  '/images/slider/2.png',
  '/images/slider/3.png',
  '/images/slider/4.png',
  '/images/products/hero_custom_trophies.png', // 5th image
];

export function InfiniteSlider() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-transparent">
      <div className="relative flex w-full flex-col">
        {/* Section Title */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center w-full">
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-[#0a0e27] tracking-tight mb-4">
            Manufacturing Excellence
          </h2>
          <p className="text-base text-[#0a0e27]/70 font-medium max-w-2xl mx-auto">
            Explore our premium collection of crafted photo frames, crystal trophies, personalized gifts, and mementos.
          </p>
        </div>

        {/* Marquee Wrapper */}
        <div className="relative w-full overflow-hidden flex">
          <motion.div
            className="flex w-max shrink-0 items-center"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              ease: 'linear',
              duration: 40,
              repeat: Infinity,
            }}
          >
            {[...sliderImages, ...sliderImages].map((src, i) => (
              <div 
                key={i} 
                className="relative w-[100vw] h-[60vh] md:h-[80vh] shrink-0"
              >
                <Image
                  src={src}
                  alt={`Slider image ${i}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={i < 2}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
