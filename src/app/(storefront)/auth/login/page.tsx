'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/storefront/AuthContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectToRaw = searchParams.get('redirect') || '/';
  const redirectTo = (redirectToRaw.startsWith('/') && !redirectToRaw.startsWith('//')) ? redirectToRaw : '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f0fafb] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <ShoppingBag className="w-8 h-8 text-[#2aabb0] group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-extrabold text-secondary tracking-tight">R Creation</span>
          </Link>
          <p className="text-sm text-neutral-500 mt-2">Welcome back! Sign in to your account.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
          <div className="p-8">
            <h1 className="text-xl font-bold text-secondary mb-6">Sign In</h1>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl text-center animate-in fade-in slide-in-from-top-1">
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
                    className="w-full pl-10 pr-3.5 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2aabb0] focus:border-[#2aabb0] focus:outline-none transition-all"
                    placeholder="rcreationsstudio@gmail.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2aabb0] focus:border-[#2aabb0] focus:outline-none transition-all"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 text-[#2aabb0]" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-neutral-50 border-t border-neutral-100 text-center">
            <p className="text-sm text-neutral-600">
              Don&apos;t have an account?{' '}
              <Link
                href={`/auth/register${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                className="font-bold text-[#2aabb0] hover:text-[#238d91] transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Back to store */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f0fafb] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#2aabb0]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
