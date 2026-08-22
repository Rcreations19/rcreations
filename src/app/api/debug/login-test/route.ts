import { NextResponse } from 'next/server';
import { createClient as createStatelessClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const envEmail = process.env.ADMIN_EMAIL?.trim();
  const envPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  
  const emailMatch = envEmail ? email.trim().toLowerCase() === envEmail.toLowerCase() : false;
  let bcryptMatch = false;
  if (envPasswordHash) {
    try {
      bcryptMatch = await bcrypt.compare(password, envPasswordHash);
    } catch (e) {
      bcryptMatch = false;
    }
  }
  const isEnvAdmin = envEmail ? emailMatch && bcryptMatch : false;

  const statelessSupabase = createStatelessClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { data, error: signInError } = await statelessSupabase.auth.signInWithPassword({ email, password });

  return NextResponse.json({
    email,
    enteredEmail: email.trim(),
    envEmail,
    emailMatch,
    bcryptMatch,
    isEnvAdmin,
    envEmailSet: !!envEmail,
    envPasswordHashSet: !!process.env.ADMIN_PASSWORD_HASH,
    signInError: signInError ? { code: signInError.code, message: signInError.message } : null,
    hasSession: !!data?.session,
    userId: data?.user?.id || null,
  });
}