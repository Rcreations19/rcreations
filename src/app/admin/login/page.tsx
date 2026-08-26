'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2, ShieldAlert, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginAdmin, verifyAdminOtp } from '@/lib/actions/auth';
import { RCreationLogo } from '@/components/shared/Logo';

export default function AdminLoginPage() {
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const result = await loginAdmin(formData);

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.step === 'otp') {
        setStep('otp');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('code', otp);
      formData.append('password', password);

      const result = await verifyAdminOtp(formData);

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid security code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        html { background-image: none !important; }
      `}</style>
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-4 selection:bg-accent selection:text-white relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-80 bg-[#10164A] rounded-b-[100px] shadow-lg pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-neutral-100 overflow-hidden min-h-[480px] flex flex-col">
          
          {/* Header */}
          <div className="pt-12 pb-8 px-10 text-center relative border-b border-neutral-100 bg-white">
            <div className="flex justify-center mb-6">
               <RCreationLogo variant="full-horizontal" theme="light" iconSize={60} />
            </div>
            
            <h1 className="text-xl font-extrabold text-[#10164A] tracking-tight">
              Enterprise Admin Portal
            </h1>
            <p className="text-neutral-500 text-[11px] font-bold uppercase tracking-wider mt-2">
              {step === 'login' ? 'Secure System Access' : 'Two-Factor Authentication'}
            </p>
          </div>

          {/* Form Area */}
          <div className="px-10 py-10 bg-white flex-1 relative">
            <AnimatePresence mode="wait">
              {step === 'login' ? (
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin} 
                  className="space-y-6"
                >
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-lg text-center flex items-center justify-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4" /> {error}
                    </motion.div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-2">
                        Admin Email Address
                      </label>
                      <div className="relative group">
                        <Mail className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-accent transition-colors" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-[#10164A] placeholder-neutral-400 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-2">
                        Password
                      </label>
                      <div className="relative group">
                        <Lock className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-accent transition-colors" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-[#10164A] placeholder-neutral-400 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all tracking-widest font-mono"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <a
                      href="/auth/forgot-password"
                      className="text-xs font-semibold text-accent hover:text-[#238d91] transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-accent text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#239095] hover:shadow-lg hover:shadow-[#2aabb0]/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Verify Credentials</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                      <strong className="text-[#10164A]">{email}</strong>
                    </p>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-lg text-center flex items-center justify-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4" /> {error}
                    </motion.div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block mb-2 text-center">
                      Enter Security Code
                    </label>
                    <input
                      type="text"
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
                      <span>Complete Login</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('login'); setOtp(''); setError(null); }}
                    className="w-full py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    Back to password login
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
}
