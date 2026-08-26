import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Skeleton */}
        <div className="mb-10">
          <div className="w-48 h-8 bg-neutral-200 animate-pulse rounded-lg" />
          <div className="w-64 h-4 bg-neutral-200 animate-pulse rounded mt-3" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Sidebar Skeleton */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
            <div className="bg-white rounded-2xl border border-neutral-100 p-4 space-y-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-12 bg-neutral-100 animate-pulse rounded-xl flex items-center px-4 gap-3">
                  <div className="w-5 h-5 bg-neutral-200 animate-pulse rounded" />
                  <div className="w-24 h-4 bg-neutral-200 animate-pulse rounded" />
                </div>
              ))}
            </div>
            <div className="w-full h-12 bg-red-50 animate-pulse rounded-xl flex items-center px-4 gap-3 mt-4">
              <div className="w-5 h-5 bg-red-200/50 animate-pulse rounded" />
              <div className="w-16 h-4 bg-red-200/50 animate-pulse rounded" />
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-grow">
            <div className="bg-white rounded-3xl border border-neutral-100 p-6 sm:p-10 shadow-sm min-h-[500px]">
              <div className="w-40 h-7 bg-neutral-200 animate-pulse rounded-md mb-8" />
              
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-full p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
                      <div className="space-y-2">
                        <div className="w-32 h-5 bg-neutral-200 animate-pulse rounded" />
                        <div className="w-24 h-4 bg-neutral-200 animate-pulse rounded" />
                      </div>
                      <div className="w-20 h-8 bg-neutral-200 animate-pulse rounded-full" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-neutral-200 animate-pulse rounded-lg" />
                      <div className="space-y-2">
                        <div className="w-48 h-4 bg-neutral-200 animate-pulse rounded" />
                        <div className="w-16 h-4 bg-neutral-200 animate-pulse rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
