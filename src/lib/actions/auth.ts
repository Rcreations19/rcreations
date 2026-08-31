'use server';

import { createClient, getServiceRoleClient } from '../supabase/server';
import { rateLimit } from '../rate-limit';
import { z } from 'zod';
import { Resend } from 'resend';
import { createClient as createStatelessClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

// Helper for premium email template
const getOtpEmailHtml = (code: string, title: string, subtitle: string) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px 20px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <img src="https://rcreationframes.com/logo.png" alt="R Creation" style="height: 48px; width: auto;" />
  </div>
  <h2 style="color: #10164A; text-align: center; font-size: 20px; font-weight: 700; margin-bottom: 12px; margin-top: 0;">${title}</h2>
  <p style="color: #555555; font-size: 15px; line-height: 1.5; text-align: center; margin-bottom: 32px; margin-top: 0;">
    ${subtitle}
  </p>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 32px;">
    <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #10164A; font-family: monospace;">${code}</span>
  </div>
  <p style="color: #888888; font-size: 13px; text-align: center; margin: 0;">
    This security code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.
  </p>
</div>
`;

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

  const { data, error: signInError } = await statelessSupabase.auth.signInWithPassword({ email, password });

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
  const p = profile as { role: string; is_active: boolean } | null;
  if (!p || p.role !== 'admin' || !p.is_active) {
    return { error: 'Invalid login credentials.' };
  }

  // Generate 6-digit OTP using cryptographically secure random
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  const code = (100000 + (arr[0] % 900000)).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

  // Clean up any existing OTPs for this email to prevent .single() multiple rows error
  await adminSupabase.from('admin_otps' as any).delete().eq('email', email);

  // Hash the OTP before storing it
  const hashedCode = createHash('sha256').update(code).digest('hex');

  // Store ONLY the hashed OTP code + user identity — never store session tokens
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertError } = await adminSupabase.from('admin_otps' as any).insert({
    email,
    code: hashedCode,
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
      html: getOtpEmailHtml(
        code, 
        'Admin Access Code', 
        'Please use the following verification code to sign in to your R Creation Admin account.'
      )
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
    .from('admin_otps' as any)
    .select('*')
    .eq('email', email)
    .gte('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const otp = data as { id: string; code: string; attempts: number } | null;

  if (error || !otp) {
    console.error('[Auth] verifyAdminOtp lookup failed', { error });
    return { error: 'Invalid or expired code.' };
  }

  // Hash the user-provided code to compare with the stored hash
  const hashedInput = createHash('sha256').update(code).digest('hex');

  // OTP Burner (Zero Tolerance for Admins)
  if (otp.code !== hashedInput) {
    // Burn the OTP completely on 1st failed attempt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await adminSupabase.from('admin_otps' as any).delete().eq('id', otp.id);
    return { error: 'Invalid code. Please request a new one.' };
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

  // Cleanup used OTP
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await adminSupabase.from('admin_otps' as any).delete().eq('id', otp.id);

  return { success: true };
}

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
}