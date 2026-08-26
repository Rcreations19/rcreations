'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  // All hooks at the top - NO conditional declarations
  const [showForm, setShowForm] = useState(false);
  const [timeoutHit, setTimeoutHit] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (data.user?.user_metadata?.is_customer) {
        router.push('/auth/login');
      } else {
        router.push('/admin/login');
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Check if session already exists (race condition with detectSessionInUrl)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session) {
        setShowForm(true);
      }
    });

    // 2. Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted && event === 'PASSWORD_RECOVERY' && session) {
        setShowForm(true);
      }
    });

    // 3. Timeout fallback — if no recovery event after 5s, show error
    const timeout = setTimeout(() => {
      if (mounted && !showForm) {
        setTimeoutHit(true);
      }
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (!showForm && !timeoutHit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Verifying recovery link...</p>
        </div>
      </div>
    );
  }

  if (timeoutHit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
        <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-neutral-100 p-6 md:p-8 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-neutral-400" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" x2="12" y1="8" y2="12"></line>
              <line x1="12" x2="12.01" y1="16" y2="16"></line>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-primary mb-2">Recovery link expired or already used</h2>
          <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
            This recovery link may have expired or already been used. Please request a new one.
          </p>
          <div className="flex flex-col gap-2">
            <a href="/auth/forgot-password" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#239095] transition-colors">
              Request new link
            </a>
            <a href="/auth/login" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
              Back to login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-neutral-100 p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Set New Password</h1>
          <p className="text-sm text-neutral-500 mt-1">Enter your new password below</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg" role="alert">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-primary mb-1.5">
              New Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-primary mb-1.5">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-accent hover:bg-[#239095] text-white rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating...
              </>
            ) : (
              'Save New Password'
            )}
          </button>
        </form>
        <p className="text-center text-xs text-neutral-500 mt-6">
          <a href="/auth/login" className="text-accent hover:underline">Back to login</a>
        </p>
      </div>
    </div>
  );
}