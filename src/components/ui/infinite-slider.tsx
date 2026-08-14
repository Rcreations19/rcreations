'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, Variants } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const showcaseImages = [
  { src: '/images/slider/slider_photo_frames.png', alt: 'Premium Photo Frames' },
  { src: '/images/slider/slider_crystal_trophies.png', alt: 'Crystal Trophies' },
  { src: '/images/slider/slider_custom_gifts.png', alt: 'Custom Gifts' },
  { src: '/images/slider/premium_wooden_memento.png', alt: 'Wooden Mementos' },
  { src: '/images/slider/slider_award_collection.png', alt: 'Award Collection' },
];

export function InfiniteSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textX = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      scale: 1.05,
      opacity: 0,
      rotateY: direction > 0 ? 10 : -10,
    }),
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
      rotateY: 0,
      transition: { duration: 1.2, ease: [0.19, 1, 0.22, 1] }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      scale: 0.95,
      opacity: 0,
      rotateY: direction < 0 ? -10 : 10,
      transition: { duration: 1.2, ease: [0.19, 1, 0.22, 1] }
    }),
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1 === showcaseImages.length ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 < 0 ? showcaseImages.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <section ref={containerRef} className="py-24 lg:py-32 bg-[#050505] relative overflow-hidden flex flex-col justify-center min-h-[90vh]">
      
      {/* Background massive text */}
      <motion.div 
        style={{ x: textX }}
        className="absolute top-1/2 -translate-y-1/2 w-[200vw] text-[18vw] font-black text-white/[0.03] tracking-tighter uppercase whitespace-nowrap pointer-events-none select-none z-0"
      >
        Manufacturing Excellence
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left Content Area */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-6">
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-[1px] w-12 bg-amber-500 origin-left"
            />
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-amber-500 uppercase tracking-[0.2em] text-sm font-semibold"
            >
              Masterpiece Collection
            </motion.span>
          </div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight mb-6 leading-[1.1]"
          >
            Manufacturing <br/>
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
              Excellence
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-neutral-400 text-lg leading-relaxed mb-10 max-w-md"
          >
            Explore our premium collection of crafted photo frames, crystal trophies, personalized gifts, and meticulously designed mementos.
          </motion.p>
          
          {/* Navigation Controls inside the left area */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={prevSlide}
              className="w-14 h-14 flex items-center justify-center rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-300 group"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </button>
            <button
              onClick={nextSlide}
              className="w-14 h-14 flex items-center justify-center rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black transition-all duration-300 group shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>

        {/* Right Slider Area */}
        <div className="w-full lg:w-7/12" style={{ perspective: 1200 }}>
          <div 
            className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 border border-white/5 bg-neutral-900"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full transform-gpu"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.div style={{ y: yBg }} className="absolute inset-0 -top-[20%] -bottom-[20%] h-[140%] w-full">
                  <Image
                    src={showcaseImages[currentIndex].src}
                    alt={showcaseImages[currentIndex].alt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </motion.div>
                
                {/* Gradient overlays for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/10 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/30 via-transparent to-transparent opacity-60" />
                
                {/* Image info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 z-20">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    <div className="inline-block px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-amber-400 text-xs font-bold tracking-widest uppercase mb-4">
                      0{currentIndex + 1} / 0{showcaseImages.length}
                    </div>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-2xl">
                      {showcaseImages[currentIndex].alt}
                    </h3>
                    
                    <button className="flex items-center gap-3 text-white font-medium hover:text-amber-400 transition-colors group">
                      <span className="uppercase tracking-wider text-sm">Explore Collection</span>
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:text-black transition-all duration-300">
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Pagination Indicators */}
            <div className="absolute top-8 right-8 flex flex-col gap-3 z-30">
              {showcaseImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className="group py-2 px-1 relative flex justify-center"
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  <div className={`w-1.5 transition-all duration-500 rounded-full ${idx === currentIndex ? 'h-10 opacity-100 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'h-3 opacity-30 bg-white group-hover:opacity-60 group-hover:h-5'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
