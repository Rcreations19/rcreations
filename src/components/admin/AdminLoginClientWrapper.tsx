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
                <div className="flex items-center" style={{height:60}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="60" viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 30L17.5 25L22.5 30" stroke="#2AABB0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M27.5 35V17.5C27.5 14.46 24.96 12 21.5 12H11C7.54 12 8 16.54 8 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M35 35V17.5C35 14.46 31.96 12 28.5 12H18C14.54 12 15 16.54 15 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M43 35V17.5C43 14.46 39.96 12 36.5 12H26C22.54 12 19.5 16.54 16.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M51 35V17.5C51 14.46 47.96 12 44.5 12H34C30.54 12 31.5 16.54 31.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M59 35V17.5C59 14.46 55.96 12 52.5 12H42.5C49.46 12 46.5 16.54 49.5 20V35" stroke="#2AABB0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M67 35V17.5C67 14.46 63.96 12 49.5 12H38C35.54 12 33 16.54 33 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M75 35V17.5C75 14.46 71.96 12 68.5 12H57C53.54 12 50.5 16.54 50.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M83 35V17.5C83 14.46 79.96 12 76.5 12H65.5C61.54 12 58.5 16.54 58.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M91 35V17.5C91 14.46 87.96 12 84.5 12H73C69.54 12 66.5 16.54 66.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M99 35V17.5C99 14.46 95.96 12 92.5 12H81C77.54 12 74.5 16.54 74.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M107 35V17.5C107 14.46 103.96 12 100.5 12H89C85.54 12 82.5 16.54 82.5 20V35" stroke="#2AABB0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M115 35V17.5C115 14.46 111.96 12 108.5 12H97C93.54 12 90.5 16.54 90.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M123 35V17.5C123 14.46 119.96 12 116.5 12H105C101.54 12 98.5 16.54 98.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M131 35V17.5C131 14.46 127.96 12 124.5 12H113C109.54 12 106.5 16.54 106.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M143 35V17.5C143 14.46 139.96 12 140.5 12H128.5C124.54 12 121.5 16.54 121.5 20V35" stroke="#2AABB0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M151 35V17.5C151 14.46 147.96 12 137.5 12H125.5C121.54 12 118.5 16.54 118.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M159 35V17.5C159 14.46 155.96 12 152.5 12H140.5C136.54 12 133.5 16.54 133.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M167 35V17.5C167 14.46 163.96 12 160.5 12H148.5C144.54 12 141.5 16.54 141.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M175 35V17.5C175 14.46 171.96 12 168.5 12H156.5C152.54 12 149.5 16.54 149.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M183 35V17.5C183 14.46 179.96 12 176.5 12H164.5C160.54 12 157.5 16.54 157.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M191 35V17.5C191 14.46 187.96 12 184.5 12H172.5C168.54 12 165.5 16.54 165.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M199 35V17.5C199 14.46 195.96 12 192.5 12H180.5C176.54 12 173.5 16.54 173.5 20V35" stroke="#2AABB0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M207 35V17.5C207 14.46 203.96 12 200.5 12H188.5C184.54 12 181.5 16.54 181.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M215 35V17.5C215 14.46 211.96 12 208.5 12H196.5C192.54 12 189.5 16.54 189.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M223 35V17.5C223 14.46 219.96 12 216.5 12H204.5C200.54 12 197.5 16.54 197.5 20V35" stroke="#10164A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-xl font-extrabold text-[#10164A] tracking-tight">
                Enterprise Admin Portal
              </h1>
              <p className="text-neutral-500 text-[11px] font-bold uppercase tracking-wider mt-2">
                Secure System Access
              </p>
            </div>
            <form className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-2">
                    Admin Email Address
                  </label>
                  <div className="relative group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#2aabb0] transition-colors" aria-hidden="true">
                      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    </svg>
                    <input
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-[#10164A] placeholder-neutral-400 focus:bg-white focus:border-[#2aabb0] focus:ring-4 focus:ring-[#2aabb0]/10 focus:outline-none transition-all"
                      placeholder="rcreationframes@gmail.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#2aabb0] transition-colors" aria-hidden="true">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input
                      type="password"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-[#10164A] placeholder-neutral-400 focus:bg-white focus:border-[#2aabb0] focus:ring-4 focus:ring-[#2aabb0]/10 focus:outline-none transition-all tracking-widest font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-[#2aabb0] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#239095] hover:shadow-lg hover:shadow-[#2aabb0]/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
              >
                <span>Verify Credentials</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
                <span>Verify Credentials</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    );
  }