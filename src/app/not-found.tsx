import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found',
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center px-6 font-sans text-center">
      <div className="max-w-md w-full animate-fade-in flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
          The page you’re looking for can’t be found.
        </h1>
        <p className="text-lg text-[#86868b] mb-10 font-medium">
          It might have been removed, renamed, or did not exist in the first place.
        </p>
        
        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1d1d1f] text-white rounded-full text-[15px] font-medium hover:bg-[#000000] hover:scale-105 transition-all duration-300 shadow-sm"
        >
          Back to Safety
        </Link>
      </div>
    </div>
  );
}
