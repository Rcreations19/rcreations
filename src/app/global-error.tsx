'use client';
 
// import * as Sentry from '@sentry/nextjs'; // Prepared for telemetry
import { useEffect } from 'react';
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('GLOBAL_ERROR_CAUGHT:', error);
    // Sentry.captureException(error);
  }, [error]);
 
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">A critical system error occurred</h2>
          <p className="text-neutral-600 mb-8 max-w-md">Our engineering team has been notified. We apologize for the disruption.</p>
          <button
            className="px-6 py-3 bg-[#10164A] text-white rounded-xl font-bold hover:bg-[#1c246e] transition-colors"
            onClick={() => reset()}
          >
            Attempt Recovery
          </button>
        </div>
      </body>
    </html>
  );
}
