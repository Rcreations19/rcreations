'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getCustomerSession, type CustomerProfile } from '@/lib/actions/customer-profile';
import { loginCustomer, registerCustomer, logoutCustomer } from '@/lib/actions/customer-auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: CustomerProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (data: { email: string; password: string; fullName: string; phone: string }) => Promise<{ error?: string, step?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const session = await getCustomerSession();
      setUser(session);
    } catch {
      setUser(null);
    }
  }, []);

  // Hydrate user on mount
  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const result = await loginCustomer(formData);
    if (!result.success) return { error: result.error };

    await refreshUser();
    router.refresh();
    return {};
  }, [refreshUser, router]);

  const register = useCallback(async (data: { email: string; password: string; fullName: string; phone: string }) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('fullName', data.fullName);
    formData.append('phone', data.phone);

    const result = await registerCustomer(formData);
    if (!result.success) return { error: result.error };

    if (result.data?.step === 'otp') {
      return { step: 'otp' };
    }

    // Auto-login after registration (if no OTP required)
    const loginResult = await login(data.email, data.password);
    return loginResult;
  }, [login]);

  const logout = useCallback(async () => {
    await logoutCustomer();
    setUser(null);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
