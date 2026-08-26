import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f0fafb] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Brand Header Skeleton */}
        <div className="flex flex-col items-center justify-center mb-8 gap-2">
          <div className="w-12 h-12 bg-neutral-200 animate-pulse rounded-full" />
          <div className="w-32 h-6 bg-neutral-200 animate-pulse rounded" />
          <div className="w-48 h-4 bg-neutral-200 animate-pulse rounded mt-2" />
        </div>

        {/* Card Skeleton */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-8">
          <div className="w-24 h-6 bg-neutral-200 animate-pulse rounded-md mb-6" />
          
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="w-20 h-3 bg-neutral-200 animate-pulse rounded" />
              <div className="w-full h-12 bg-neutral-50 border border-neutral-200 animate-pulse rounded-xl" />
            </div>
            
            <div className="space-y-2">
              <div className="w-20 h-3 bg-neutral-200 animate-pulse rounded" />
              <div className="w-full h-12 bg-neutral-50 border border-neutral-200 animate-pulse rounded-xl" />
            </div>

            <div className="flex justify-end pt-2">
              <div className="w-24 h-3 bg-neutral-200 animate-pulse rounded" />
            </div>

            <div className="w-full h-14 bg-neutral-200 animate-pulse rounded-xl mt-2" />
          </div>
        </div>

        {/* Footer Link Skeleton */}
        <div className="flex justify-center mt-6">
          <div className="w-32 h-4 bg-neutral-200 animate-pulse rounded" />
        </div>

      </div>
    </div>
  );
}
