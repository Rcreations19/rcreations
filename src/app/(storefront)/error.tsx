'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div
      role="alert"
      className="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-[#FAFAFA]"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-md w-full text-center overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 sm:p-10 shadow-[var(--shadow-soft)]"
      >
        <div className="noise-overlay" aria-hidden />
        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <AlertTriangle className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed text-balance mb-8">
            We hit an unexpected snag while loading this page. Your cart and account are safe — please try again, or get in touch and we will sort it out.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-accent hover:bg-[#38C8CC] text-primary text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 active:scale-[0.98] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-primary/15 text-primary text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 hover:bg-primary/5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-primary/15 text-primary text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 hover:bg-primary/5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Phone className="w-4 h-4" /> Contact
            </Link>
          </div>

          <details className="mt-8 text-left" onToggle={(e) => setShowDetail((e.target as HTMLDetailsElement).open)}>
            <summary className="cursor-pointer text-[11px] font-mono text-neutral-500 hover:text-neutral-700 transition-colors list-none inline-flex items-center gap-1">
              {showDetail ? 'Hide' : 'Show'} technical detail
            </summary>
            <pre className="mt-3 font-mono text-[10px] leading-relaxed text-neutral-400 bg-neutral-50 p-3 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap break-words border border-neutral-100">
              {error.digest ? `Digest: ${error.digest}\n\n` : ''}{error.message}{'\n\n'}{error.stack}
            </pre>
          </details>
        </div>
      </motion.div>
    </div>
  );
}
