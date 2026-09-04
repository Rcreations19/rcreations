'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

const CONSENT_KEY = 'rc_cookie_consent';

type ConsentState = 'accepted' | 'rejected' | 'custom' | null;

interface Preferences {
  analytics: boolean;
  marketing: boolean;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function applyGtagConsent(analytics: boolean, marketing: boolean = false) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied',
    });
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>({ analytics: true, marketing: false });

  useEffect(() => {
    const mountTimer = setTimeout(() => setMounted(true), 0);
    
    const stored = localStorage.getItem(CONSENT_KEY);
    let visibilityTimer: NodeJS.Timeout;
    
    if (!stored) {
      visibilityTimer = setTimeout(() => setVisible(true), 1500);
    } else {
      try {
        const parsed = JSON.parse(stored) as Preferences;
        applyGtagConsent(parsed.analytics, parsed.marketing);
      } catch {
        /* ignore */
      }
    }
    
    return () => {
      clearTimeout(mountTimer);
      if (visibilityTimer) clearTimeout(visibilityTimer);
    };
  }, []);

  function saveConsent(analytics: boolean, marketing: boolean, state: ConsentState) {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ state, analytics, marketing, functional: true, timestamp: Date.now() })
    );
    applyGtagConsent(analytics, marketing);
    setVisible(false);
  }

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="true"
      className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-auto md:right-8 z-[100] pointer-events-none flex flex-col items-center md:items-end justify-end"
    >
      {/* Apple-style floating card: translucent, blur, soft shadow, highly rounded */}
      <div className="bg-white/85 backdrop-blur-2xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] rounded-[24px] border border-white/40 overflow-hidden pointer-events-auto w-full md:w-[400px] animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out">
        <div className="p-6">
          
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/5 p-2 rounded-full">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-primary tracking-tight">Your Privacy</h2>
          </div>
          
          <p className="text-[13px] text-neutral-600 leading-relaxed mb-5">
            We use essential cookies to keep our site secure and working properly. We&apos;d also like to use analytics cookies to help us improve your experience. 
            <span className="block mt-1">
              Read our <Link href="/cookies" className="text-primary font-medium hover:underline underline-offset-2 transition-all">Cookie Policy</Link>.
            </span>
          </p>

          {/* Preferences Accordion */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showPrefs ? 'max-h-[300px] opacity-100 mb-5' : 'max-h-0 opacity-0 mb-0'}`}>
            <div className="space-y-3 pt-2 border-t border-black/5">
              
              <div className="flex items-center justify-between gap-3 bg-black/5 p-3 rounded-2xl">
                <div>
                  <h3 className="text-[13px] font-semibold text-primary">Essential</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">Required for the site to function properly.</p>
                </div>
                <span className="text-[10px] font-semibold text-neutral-400 bg-white px-2 py-1 rounded-full shadow-sm">Required</span>
              </div>
              
              <div className="flex items-center justify-between gap-3 bg-black/5 p-3 rounded-2xl">
                <div>
                  <h3 className="text-[13px] font-semibold text-primary">Analytics</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">Help us understand how you use our site.</p>
                </div>
                
                {/* Apple-style toggle */}
                <button
                  role="switch"
                  aria-checked={prefs.analytics}
                  onClick={() => setPrefs((p) => ({ ...p, analytics: !p.analytics }))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${prefs.analytics ? 'bg-primary' : 'bg-neutral-300'}`}
                  aria-label="Toggle analytics cookies"
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out ${prefs.analytics ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 bg-black/5 p-3 rounded-2xl mt-3">
                <div>
                  <h3 className="text-[13px] font-semibold text-primary">Marketing & Ads</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">Used to deliver personalized advertisements.</p>
                </div>
                
                {/* Apple-style toggle */}
                <button
                  role="switch"
                  aria-checked={prefs.marketing}
                  onClick={() => setPrefs((p) => ({ ...p, marketing: !p.marketing }))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${prefs.marketing ? 'bg-primary' : 'bg-neutral-300'}`}
                  aria-label="Toggle marketing cookies"
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out ${prefs.marketing ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {showPrefs ? (
              <button
                onClick={() => saveConsent(prefs.analytics, prefs.marketing, 'custom')}
                className="w-full bg-primary hover:bg-primary-hover text-white text-[13px] font-medium px-4 py-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Save Preferences
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => saveConsent(false, false, 'rejected')}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[13px] font-medium px-4 py-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:ring-offset-2"
                >
                  Decline
                </button>
                <button
                  onClick={() => saveConsent(true, true, 'accepted')}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white text-[13px] font-medium px-4 py-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Allow All
                </button>
              </div>
            )}
            
            <button
              onClick={() => setShowPrefs(!showPrefs)}
              className="flex items-center justify-center gap-1 mt-1 text-[12px] font-medium text-neutral-500 hover:text-primary transition-colors focus:outline-none py-1"
              aria-expanded={showPrefs}
            >
              {showPrefs ? 'Hide Options' : 'Customize Options'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
