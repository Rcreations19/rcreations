'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Phone, ArrowRight, Loader2, ShoppingBag, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '@/components/storefront/AuthContext';
import { verifyCustomerRegistrationOtp } from '@/lib/actions/customer-auth';
import { motion, AnimatePresence } from 'framer-motion';

function RegisterForm() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, refreshUser, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const passwordStrength = (() => {
    const p = form.password;
    if (p.length === 0) return { score: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-400' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-400' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-400' };
    if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
    return { score: 5, label: 'Excellent', color: 'bg-emerald-500' };
  })();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const result = await register({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      phone: form.phone,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.step === 'otp') {
      setStep('otp');
      setLoading(false);
      return;
    }

    router.push(redirectTo);
  };


  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('code', otp);

      const result = await verifyCustomerRegistrationOtp(formData);

      if (!result?.success) {
        throw new Error(result.error);
      }

      // Explicitly sign in after OTP verification so the session cookie is
      // properly set via signInWithPassword (signUp alone doesn't reliably
      // write the SSR cookie in Next.js server actions).
      const loginResult = await login(form.email, form.password);
      if (loginResult.error) {
        // If auto-login fails, still redirect — user can manually log in
        console.warn('[Register] Auto-login after OTP failed:', loginResult.error);
        await refreshUser();
      }

      router.push(redirectTo);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid security code');
      }
    } finally {
      setLoading(false);
    }
  };



  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f0fafb] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <ShoppingBag className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-extrabold text-[#10164A] tracking-tight">R Creation</span>
          </Link>
          <p className="text-sm text-neutral-500 mt-2">Create your account to get started.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
          <div className="p-8">
            <h1 className="text-xl font-bold text-[#10164A] mb-6">
              {step === 'register' ? 'Create Account' : 'Check your email'}
            </h1>

            <AnimatePresence mode="wait">
              {step === 'register' ? (
                <motion.form 
                  key="register-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleRegister} 
                  className="space-y-4"
                >
                  {error && (
                    <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl text-center animate-in fade-in slide-in-from-top-1">
                      {error}
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={form.fullName}
                        onChange={(e) => update('fullName', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:outline-none transition-all"
                        placeholder="Your full name"
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:outline-none transition-all"
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Phone — optional */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">
                      Mobile Number <span className="font-normal text-neutral-400 normal-case tracking-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        inputMode="tel"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:outline-none transition-all"
                        placeholder="+91 87549 40610"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                        className="w-full pl-10 pr-11 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-accent focus:border-accent focus:outline-none transition-all"
                        placeholder="Min. 6 characters"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password strength bar */}
                    {form.password.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(level => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                level <= passwordStrength.score ? passwordStrength.color : 'bg-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-neutral-500">{passwordStrength.label}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={form.confirmPassword}
                        onChange={(e) => update('confirmPassword', e.target.value)}
                        className={`w-full pl-10 pr-11 py-3 bg-neutral-50 border rounded-xl text-base md:text-sm focus:ring-2 focus:ring-accent focus:outline-none transition-all ${
                          form.confirmPassword.length > 0 && form.password !== form.confirmPassword
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
                            : form.confirmPassword.length > 0 && form.password === form.confirmPassword
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-300'
                            : 'border-neutral-200 focus:border-accent'
                        }`}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Real-time match indicator */}
                    {form.confirmPassword.length > 0 && (
                      <p className={`text-[11px] mt-1.5 font-medium flex items-center gap-1 ${
                        form.password === form.confirmPassword ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {form.password === form.confirmPassword ? (
                          <><CheckCircle2 className="w-3 h-3" /> Passwords match</>
                        ) : (
                          <><span className="w-3 h-3 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-black">✕</span> Passwords don&apos;t match</>
                        )}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#10164A] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1c246e] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#10164A]/20 active:scale-[0.98] mt-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4 text-accent" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="otp-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleVerifyOtp} 
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <KeyRound className="w-6 h-6 text-accent" />
                    </div>
                    <p className="text-sm text-neutral-600">
                      We&apos;ve sent a 6-digit security code to<br />
                      <strong className="text-[#10164A]">{form.email}</strong>
                    </p>
                  </div>

                  {error && (
                    <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl text-center animate-in fade-in slide-in-from-top-1">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5 text-center">
                      Enter Security Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-4 bg-neutral-50 border border-neutral-200 rounded-xl text-2xl text-center font-bold text-[#10164A] tracking-[0.5em] focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all"
                      placeholder="------"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-4 bg-[#10164A] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#0a0e30] hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span>Verify Account</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('register'); setOtp(''); setError(null); }}
                    className="w-full py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    Change email address
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {step === 'register' && (
            <div className="px-8 py-5 bg-neutral-50 border-t border-neutral-100 text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{' '}
                <Link
                  href={`/auth/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                  className="font-bold text-accent hover:text-[#238d91] transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f0fafb] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
