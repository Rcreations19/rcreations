'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X, ChevronDown, ShieldCheck, BarChart2 } from 'lucide-react';

const CONSENT_KEY = 'rc_cookie_consent';

type ConsentState = 'accepted' | 'rejected' | 'custom' | null;

interface Preferences {
  analytics: boolean;
  functional: boolean;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function applyGtagConsent(analytics: boolean) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>({
    analytics: true,
    functional: true,
  });

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Delay slightly so page renders first
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    } else {
      // Re-apply previously saved consent on every load
      try {
        const parsed = JSON.parse(stored) as { analytics: boolean };
        applyGtagConsent(parsed.analytics);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  function saveConsent(analytics: boolean, state: ConsentState) {
    const payload = { state, analytics, functional: true, timestamp: Date.now() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
    applyGtagConsent(analytics);
    setVisible(false);
  }

  function handleAcceptAll() {
    saveConsent(true, 'accepted');
  }

  function handleRejectNonEssential() {
    saveConsent(false, 'rejected');
  }

  function handleSavePrefs() {
    saveConsent(prefs.analytics, 'custom');
  }

  if (!mounted || !visible) return null;

  return (
    <>
      {/* Backdrop blur on mobile */}
      <div
        className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-[2px] md:hidden"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Cookie consent"
        aria-modal="true"
        className="fixed bottom-0 left-0 right-0 z-[999] animate-slide-up"
      >
        <div className="mx-auto max-w-5xl px-4 pb-4 md:px-6 md:pb-6">
          <div
            className="relative rounded-2xl border border-white/10 overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,4,32,0.97) 0%, rgba(8,14,60,0.97) 100%)',
              backdropFilter: 'blur(24px)',
              boxShadow:
                '0 -4px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            {/* Top accent line */}
            <div
              className="h-[2px] w-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent, #c9a84c, transparent)',
              }}
            />

            <div className="p-5 md:p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center shrink-0">
                    <Cookie className="w-4 h-4 text-[#c9a84c]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white leading-tight">
                      We value your privacy
                    </h2>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      R Creation · rcreationframes.com
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRejectNonEssential}
                  className="text-neutral-500 hover:text-white transition-colors mt-0.5 shrink-0"
                  aria-label="Reject non-essential cookies and close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                We use cookies to improve your browsing experience and analyse site traffic via Google Analytics.
                Essential cookies (session, cart) are always active.{' '}
                <Link
                  href="/cookies"
                  className="text-[#c9a84c] hover:underline underline-offset-2"
                >
                  Cookie Policy
                </Link>{' '}
                ·{' '}
                <Link
                  href="/privacy"
                  className="text-[#c9a84c] hover:underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
              </p>

              {/* Manage Preferences toggle */}
              <div className="mb-4">
                <button
                  onClick={() => setShowPrefs((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-white transition-colors"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${showPrefs ? 'rotate-180' : ''}`}
                  />
                  Manage preferences
                </button>

                {showPrefs && (
                  <div className="mt-3 space-y-2 pl-1">
                    {/* Functional — always on */}
                    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-white">Essential & Functional</p>
                          <p className="text-[10px] text-neutral-500">Session, cart, auth — always required</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                        Always on
                      </span>
                    </div>

                    {/* Analytics */}
                    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <BarChart2 className="w-3.5 h-3.5 text-[#c9a84c] shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-white">Analytics</p>
                          <p className="text-[10px] text-neutral-500">Google Analytics — page views &amp; traffic</p>
                        </div>
                      </div>
                      <button
                        role="switch"
                        aria-checked={prefs.analytics}
                        onClick={() => setPrefs((p) => ({ ...p, analytics: !p.analytics }))}
                        className={`relative w-9 h-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] ${
                          prefs.analytics ? 'bg-[#c9a84c]' : 'bg-neutral-700'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            prefs.analytics ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  id="cookie-accept-all"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#c9a84c] text-[#000420] hover:bg-[#d4b56a] transition-all"
                >
                  Accept All
                </button>

                {showPrefs ? (
                  <button
                    id="cookie-save-prefs"
                    onClick={handleSavePrefs}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/20 text-white hover:bg-white/10 transition-all"
                  >
                    Save Preferences
                  </button>
                ) : (
                  <button
                    id="cookie-reject"
                    onClick={handleRejectNonEssential}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/20 text-white hover:bg-white/10 transition-all"
                  >
                    Reject Non-Essential
                  </button>
                )}
              </div>

              {/* Legal note */}
              <p className="text-[10px] text-neutral-600 mt-3 leading-relaxed">
                In accordance with India&rsquo;s Digital Personal Data Protection Act, 2023 (DPDPA).
                Your preferences are saved locally and never transmitted to our servers.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}
