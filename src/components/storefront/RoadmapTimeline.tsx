'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type RoadmapMilestone = {
  year: string;
  title: string;
  desc: string;
};

interface Props {
  milestones: RoadmapMilestone[];
}

export function RoadmapTimeline({ milestones }: Props) {
  if (!milestones || milestones.length === 0) return null;

  return (
    <div className="relative max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* Vertical Line */}
      <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold-accent/30 to-transparent transform md:-translate-x-1/2" />

      <div className="space-y-12 md:space-y-24 relative">
        {milestones.map((milestone, index) => {
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 1.02, 0.73, 1] }}
              className={`flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0 ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Timeline Dot (Mobile & Desktop) */}
              <div className="absolute left-[20px] md:left-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-gold-accent shadow-[0_0_15px_rgba(212,175,55,0.4)] transform -translate-x-1/2 mt-1.5 md:mt-0 z-10" />

              {/* Content Card */}
              <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? 'md:pr-16 text-left md:text-right' : 'md:pl-16 text-left'}`}>
                <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-neutral-100 shadow-[var(--shadow-soft)] hover:shadow-md transition-all duration-300 group bg-white/95 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold-accent/5 rounded-bl-full pointer-events-none" />
                  <span className="inline-block text-gold-accent font-mono font-bold text-lg mb-2">
                    {milestone.year}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3">
                    {milestone.title}
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-800 leading-relaxed">
                    {milestone.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
