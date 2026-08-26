import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fcfdfd] py-12 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Skeleton */}
        <div className="mb-12">
          <div className="w-48 h-8 bg-neutral-200 animate-pulse rounded-lg mb-4" />
          <div className="w-64 h-4 bg-neutral-200 animate-pulse rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Column (Forms) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* Contact Info Box */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="w-1/3 h-6 bg-neutral-200 animate-pulse rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full h-12 bg-neutral-100 animate-pulse rounded-xl" />
                <div className="w-full h-12 bg-neutral-100 animate-pulse rounded-xl" />
              </div>
            </div>

            {/* Shipping Box */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="w-1/3 h-6 bg-neutral-200 animate-pulse rounded-md" />
              <div className="w-full h-12 bg-neutral-100 animate-pulse rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full h-12 bg-neutral-100 animate-pulse rounded-xl" />
                <div className="w-full h-12 bg-neutral-100 animate-pulse rounded-xl" />
              </div>
            </div>

          </div>

          {/* Right Column (Order Summary) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-neutral-50 border border-neutral-200 rounded-3xl p-6 sm:p-8 sticky top-32">
            <div className="w-1/2 h-6 bg-neutral-200 animate-pulse rounded-md mb-6" />
            
            {/* Items */}
            <div className="space-y-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-neutral-200 animate-pulse rounded-lg flex-shrink-0" />
                  <div className="space-y-2 flex-grow">
                    <div className="w-full h-4 bg-neutral-200 animate-pulse rounded" />
                    <div className="w-1/2 h-3 bg-neutral-200 animate-pulse rounded" />
                  </div>
                  <div className="w-12 h-4 bg-neutral-200 animate-pulse rounded" />
                </div>
              ))}
            </div>

            <div className="w-full h-px bg-neutral-200 mb-6" />
            
            {/* Totals */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between">
                <div className="w-20 h-4 bg-neutral-200 animate-pulse rounded" />
                <div className="w-16 h-4 bg-neutral-200 animate-pulse rounded" />
              </div>
              <div className="flex justify-between">
                <div className="w-20 h-4 bg-neutral-200 animate-pulse rounded" />
                <div className="w-16 h-4 bg-neutral-200 animate-pulse rounded" />
              </div>
              <div className="flex justify-between pt-4 border-t border-neutral-200">
                <div className="w-24 h-6 bg-neutral-200 animate-pulse rounded" />
                <div className="w-20 h-6 bg-neutral-300 animate-pulse rounded" />
              </div>
            </div>

            <div className="w-full h-14 bg-neutral-300 animate-pulse rounded-xl" />
          </div>

        </div>
      </div>
    </div>
  );
}
