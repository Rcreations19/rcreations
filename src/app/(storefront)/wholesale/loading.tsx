import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      
      {/* Hero Skeleton */}
      <div className="bg-secondary py-20 lg:py-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-32 h-8 bg-white/10 animate-pulse rounded-full mx-auto" />
          <div className="w-3/4 h-12 bg-white/20 animate-pulse rounded-lg mx-auto" />
          <div className="w-1/2 h-6 bg-white/10 animate-pulse rounded mx-auto" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left: Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex gap-4">
                <div className="w-12 h-12 bg-neutral-200 animate-pulse rounded-full flex-shrink-0" />
                <div className="space-y-3 flex-grow">
                  <div className="w-2/3 h-5 bg-neutral-200 animate-pulse rounded" />
                  <div className="w-full h-4 bg-neutral-100 animate-pulse rounded" />
                  <div className="w-4/5 h-4 bg-neutral-100 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Right: B2B Form / Table Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-xl shadow-neutral-200/40 p-8 sm:p-12">
              <div className="w-1/3 h-8 bg-neutral-200 animate-pulse rounded-lg mb-8" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="w-full h-14 bg-neutral-100 animate-pulse rounded-xl" />
                <div className="w-full h-14 bg-neutral-100 animate-pulse rounded-xl" />
                <div className="w-full h-14 bg-neutral-100 animate-pulse rounded-xl" />
                <div className="w-full h-14 bg-neutral-100 animate-pulse rounded-xl" />
              </div>
              
              <div className="w-full h-32 bg-neutral-100 animate-pulse rounded-xl mb-6" />
              <div className="w-full sm:w-48 h-14 bg-neutral-200 animate-pulse rounded-xl" />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
