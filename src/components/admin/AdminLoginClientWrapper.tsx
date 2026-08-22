'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const AdminLoginContent = dynamic(
  () => import('@/app/admin/login/AdminLoginContent'),
  {
    ssr: false,
    // No loading component - parent page handles loading state
  }
);

export default function AdminLoginClientWrapper() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-4 selection:bg-[#2aabb0] selection:text-white relative overflow-hidden font-sans">
        <div className="w-full max-w-[440px] relative z-10">
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-neutral-100 overflow-hidden min-h-[480px] flex flex-col">
            <div className="pt-12 pb-8 px-10 text-center relative border-b border-neutral-100 bg-white">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-8 bg-[#10164A] rounded"></div>
              </div>
              <h1 className="text-xl font-extrabold text-[#10164A] tracking-tight">
                Enterprise Admin Portal
              </h1>
              <p className="text-neutral-500 text-[11px] font-bold uppercase tracking-wider mt-2">
                Secure System Access
              </p>
            </div>
            <div className="px-10 py-10 bg-white flex-1 relative">
              <div className="h-96 flex items-center justify-center">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLoginContent />
  );
}