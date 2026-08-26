'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, ShoppingBag, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { requestCustomerPasswordReset } from '@/lib/actions/customer-auth';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('email', email);

    const result = await requestCustomerPasswordReset(formData);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f0fafb] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <ShoppingBag className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-extrabold text-secondary tracking-tight">R Creation</span>
          </Link>
          <p className="text-sm text-neutral-500 mt-2">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
          <div className="p-8">
            <h1 className="text-xl font-bold text-secondary mb-2">
              {sent ? 'Check your email' : 'Forgot Password'}
            </h1>

            {sent ? (
              <div className="text-center mt-4 space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm text-neutral-600">
                  If an account exists with <strong className="text-secondary">{email}</strong>, we&apos;ve sent a password reset link.
                </p>
                <p className="text-xs text-neutral-400">
                  Didn&apos;t receive the email? Check your spam folder or try again.
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-[#238d91] transition-colors mt-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-neutral-500 mb-6">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl text-center animate-in fade-in slide-in-from-top-1">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:outline-none transition-all"
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-secondary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary-hover transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-secondary/20 active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight className="w-4 h-4 text-accent" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {!sent && (
            <div className="px-8 py-5 bg-neutral-50 border-t border-neutral-100 text-center">
              <p className="text-sm text-neutral-600">
                Remember your password?{' '}
                <Link
                  href="/auth/login"
                  className="font-bold text-accent hover:text-[#238d91] transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f0fafb] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
