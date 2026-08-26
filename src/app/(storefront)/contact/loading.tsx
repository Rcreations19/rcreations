import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fcfdfd] py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Skeleton */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="w-48 h-10 bg-neutral-200 animate-pulse rounded-lg mx-auto" />
          <div className="w-full h-5 bg-neutral-200 animate-pulse rounded mx-auto" />
          <div className="w-3/4 h-5 bg-neutral-200 animate-pulse rounded mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left Column (Contact Info) */}
          <div className="space-y-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-12 h-12 bg-neutral-200 animate-pulse rounded-full flex-shrink-0" />
                <div className="space-y-3">
                  <div className="w-32 h-6 bg-neutral-200 animate-pulse rounded-md" />
                  <div className="w-48 h-4 bg-neutral-200 animate-pulse rounded" />
                  <div className="w-40 h-4 bg-neutral-200 animate-pulse rounded" />
                </div>
              </div>
            ))}

            <div className="pt-8 border-t border-neutral-100">
              <div className="w-full h-64 bg-neutral-200 animate-pulse rounded-3xl" />
            </div>
          </div>

          {/* Right Column (Form Box) */}
          <div>
            <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xl shadow-neutral-200/40">
              <div className="w-40 h-8 bg-neutral-200 animate-pulse rounded-lg mb-8" />
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="w-20 h-3 bg-neutral-200 animate-pulse rounded" />
                    <div className="w-full h-12 bg-neutral-100 animate-pulse rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-20 h-3 bg-neutral-200 animate-pulse rounded" />
                    <div className="w-full h-12 bg-neutral-100 animate-pulse rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="w-20 h-3 bg-neutral-200 animate-pulse rounded" />
                  <div className="w-full h-12 bg-neutral-100 animate-pulse rounded-xl" />
                </div>

                <div className="space-y-2">
                  <div className="w-20 h-3 bg-neutral-200 animate-pulse rounded" />
                  <div className="w-full h-32 bg-neutral-100 animate-pulse rounded-xl" />
                </div>

                <div className="w-full h-14 bg-neutral-200 animate-pulse rounded-xl pt-2 mt-4" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
