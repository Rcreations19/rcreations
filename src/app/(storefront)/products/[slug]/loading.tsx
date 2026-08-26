import React from 'react';

export default function Loading() {
  return (
    <div className="bg-[#fcfdfd] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Skeleton */}
        <div className="flex gap-2 mb-8 items-center">
          <div className="w-16 h-4 bg-neutral-200 animate-pulse rounded" />
          <div className="w-4 h-4 bg-neutral-200 animate-pulse rounded" />
          <div className="w-24 h-4 bg-neutral-200 animate-pulse rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column: Image Skeleton */}
          <div className="space-y-4">
            <div className="w-full aspect-square bg-neutral-200 animate-pulse rounded-2xl" />
            <div className="flex gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-24 h-24 bg-neutral-200 animate-pulse rounded-xl flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Right Column: Details Skeleton */}
          <div className="space-y-8 mt-4 lg:mt-0">
            <div className="space-y-4">
              <div className="w-3/4 h-10 bg-neutral-200 animate-pulse rounded-lg" />
              <div className="w-1/2 h-6 bg-neutral-200 animate-pulse rounded-md" />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-32 h-8 bg-neutral-200 animate-pulse rounded-full" />
              <div className="w-24 h-6 bg-neutral-200 animate-pulse rounded-md" />
            </div>

            <div className="w-48 h-12 bg-neutral-200 animate-pulse rounded-xl" />
            <div className="w-full h-px bg-neutral-100" />

            <div className="space-y-4">
              <div className="w-full h-4 bg-neutral-200 animate-pulse rounded" />
              <div className="w-full h-4 bg-neutral-200 animate-pulse rounded" />
              <div className="w-5/6 h-4 bg-neutral-200 animate-pulse rounded" />
            </div>

            {/* Actions Skeleton */}
            <div className="space-y-4 pt-4">
              <div className="w-full h-14 bg-neutral-200 animate-pulse rounded-xl" />
              <div className="flex gap-4">
                <div className="w-1/2 h-12 bg-neutral-200 animate-pulse rounded-xl" />
                <div className="w-1/2 h-12 bg-neutral-200 animate-pulse rounded-xl" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
