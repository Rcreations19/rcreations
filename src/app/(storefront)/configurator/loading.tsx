import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-white pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="w-64 h-10 bg-neutral-200 animate-pulse rounded-lg mx-auto" />
          <div className="w-96 h-5 bg-neutral-200 animate-pulse rounded mx-auto" />
        </div>

        {/* Stepper Skeleton */}
        <div className="flex justify-between items-center mb-16 relative px-4">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-100 -z-10 -translate-y-1/2" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 bg-white px-2">
              <div className="w-12 h-12 rounded-full bg-neutral-200 animate-pulse border-4 border-white" />
              <div className="w-20 h-3 bg-neutral-200 animate-pulse rounded" />
            </div>
          ))}
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl shadow-xl shadow-neutral-200/40 border border-neutral-100 p-8 sm:p-12 min-h-[500px] flex flex-col justify-between">
          <div className="space-y-8">
            <div className="w-48 h-8 bg-neutral-200 animate-pulse rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full h-32 bg-neutral-100 animate-pulse rounded-2xl border border-neutral-100" />
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-12 pt-8 border-t border-neutral-100">
            <div className="w-32 h-12 bg-neutral-100 animate-pulse rounded-xl" />
            <div className="w-40 h-12 bg-neutral-200 animate-pulse rounded-xl" />
          </div>
        </div>

      </div>
    </div>
  );
}
