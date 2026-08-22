'use server';

import { createClient, getServiceRoleClient } from '../supabase/server';
import { rateLimit } from '../rate-limit';
import { z } from 'zod';
import { Resend } from 'resend';
import { createClient as createStatelessClient } from '@supabase/supabase-js';


const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(1, 'Password is required').max(255),
});

const otpSchema = z.object({
  email: z.string().email().max(255),
  code: z.string().length(6, 'OTP must be exactly 6 digits'),
  password: z.string().min(1, 'Password is required').max(255),
});

export async function loginAdmin(formData: FormData) {
  const rl = await rateLimit(5, 60000); // 5 attempts per min
  if (!rl.success) return { error: rl.error };

  const parsed = loginSchema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  
  const { email, password } = parsed.data;

  const statelessSupabase = createStatelessClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  let { data, error: signInError } = await statelessSupabase.auth.signInWithPassword({ email, password });

  if (signInError || !data.session) {
    console.error('[Auth] Login failed — returning error to client', {
      signInError: signInError?.message,
      hasSession: !!data?.session,
    });
    return { error: 'Invalid login credentials.' };
  }

  // Check Role
  const adminSupabase = await getServiceRoleClient();
  const { data: profile } = await adminSupabase.from('profiles').select('role, is_active').eq('id', data.user.id).single();
  const p = profile as any;
  if (!p || p.role !== 'admin' || !p.is_active) {
    return { error: 'Unauthorized. Admin access required.' };
  }

  // Generate 6-digit OTP using cryptographically secure random
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  const code = (100000 + (arr[0] % 900000)).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

  // Store ONLY the OTP code + user identity — never store session tokens
  const { error: insertError } = await adminSupabase.from('admin_otps').insert({
    email,
    code,
    expires_at: expiresAt
  });

  if (insertError) {
    console.error('[Auth] Failed to store OTP', { code: insertError.code, message: insertError.message });
    return { error: 'Failed to generate security code.' };
  }

  // Send Email
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || '');
    await resend.emails.send({
      from: 'R Creation Security <noreply@rcreationframes.com>',
      to: email,
      subject: 'Your Admin Login Code',
      html: `<p>Your R Creation Admin Login code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`
    });
  } catch (err) {
    console.error('[Auth] Failed to send OTP email', { message: (err as Error).message });
    return { error: 'Failed to send security code.' };
  }

  return { success: true, step: 'otp' };
}

export async function verifyAdminOtp(formData: FormData) {
  const rl = await rateLimit(10, 60000); 
  if (!rl.success) return { error: rl.error };

  const parsed = otpSchema.safeParse({
    email: formData.get('email'),
    code: formData.get('code'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  
  const { email, code, password } = parsed.data;

  const adminSupabase = await getServiceRoleClient();
  
  // Find OTP (no tokens stored — only code + expiry)
  const { data, error } = await adminSupabase
    .from('admin_otps')
    .select('id')
    .eq('email', email)
    .eq('code', code)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return { error: 'Invalid or expired code.' };
  }

  // Re-authenticate with password to derive a fresh session (no stored tokens)
  const statelessSupabase = createStatelessClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: freshSession, error: signInError } = await statelessSupabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !freshSession.session) {
    console.error('[Auth] OTP verify — re-auth failed', { code: signInError?.code, message: signInError?.message });
    return { error: 'Failed to authenticate session.' };
  }

  console.log('[Auth] OTP verify — re-auth succeeded, setting session...');

  // Set the fresh session using the cookie-aware client
  const supabase = await createClient();
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: freshSession.session.access_token,
    refresh_token: freshSession.session.refresh_token
  });

  if (sessionError) {
    console.error('[Auth] OTP verify — setSession failed', { code: sessionError.code, message: sessionError.message });
    return { error: 'Failed to authenticate session.' };
  }

  console.log('[Auth] OTP verify — session set successfully');

  // Cleanup used OTP
  await adminSupabase.from('admin_otps').delete().eq('id', data.id);

  return { success: true };
}

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
}