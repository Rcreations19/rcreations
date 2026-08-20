'use server';

import { createClient, getServiceRoleClient } from '../supabase/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { rateLimit } from '../rate-limit';

interface AuthResult {
  success?: boolean;
  error?: string;
  step?: string;
}

const registerSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(255, 'Password is too long'),
  fullName: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  phone: z.string().max(20, 'Phone is too long').optional(),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(255),
  code: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export async function registerCustomer(formData: FormData): Promise<AuthResult> {
  const rl = await rateLimit(5, 60000); 
  if (!rl.success) return { error: rl.error };

  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    phone: formData.get('phone') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password, fullName, phone } = parsed.data;

  const supabase = await createClient();

  // 1. Check if user already exists
  // We can try a dummy sign in or check customers table
  const { data: existing } = await supabase.from('customers').select('id').eq('email', email).maybeSingle();
  if (existing) {
    return { error: 'An account with this email already exists. Please login instead.' };
  }

  // 2. Generate 6-digit OTP using cryptographically secure random
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  const code = (100000 + (arr[0] % 900000)).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

  const adminSupabase = await getServiceRoleClient();

  // 3. Store in customer_otps table
  const { error: insertError } = await adminSupabase.from('customer_otps').insert({
    email,
    code,
    full_name: fullName,
    phone: phone || null,
    expires_at: expiresAt
  });

  if (insertError) {
    console.error('Failed to store OTP', { code: insertError.code });
    return { error: 'Failed to generate security code.' };
  }

  // 4. Send Email via Resend
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || '');
    await resend.emails.send({
      from: 'R Creation <onboarding@resend.dev>', // Update this when domain is verified
      to: email,
      subject: 'Verify your R Creation Account',
      html: `<p>Hi ${fullName},</p><p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`
    });
  } catch {
    console.error('Failed to send OTP email');
    return { error: 'Failed to send security code.' };
  }

  return { success: true, step: 'otp' };
}

export async function verifyCustomerRegistrationOtp(formData: FormData): Promise<AuthResult> {
  const rl = await rateLimit(10, 60000); 
  if (!rl.success) return { error: rl.error };

  const parsed = verifyOtpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    code: formData.get('code'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password, code } = parsed.data;

  const adminSupabase = await getServiceRoleClient();
  
  // 1. Verify OTP
  const { data: otpData, error: otpError } = await adminSupabase
    .from('customer_otps')
    .select('id, full_name, phone')
    .eq('email', email)
    .eq('code', code)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (otpError || !otpData) {
    return { error: 'Invalid or expired code.' };
  }

  const supabase = await createClient();

  // 2. Create the user in Supabase Auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: otpData.full_name,
        is_customer: true,
      },
    },
  });

  if (signUpError) {
    console.error('Registration error');
    return { error: 'Registration failed. Please try again.' };
  }

  if (!authData.user) {
    return { error: 'Registration failed. Please try again.' };
  }

  // 3. Create the customer profile
  const { error: profileError } = await adminSupabase.from('customers').insert({
    id: authData.user.id,
    email,
    full_name: otpData.full_name,
    phone: otpData.phone,
  });

  if (profileError) {
    console.error('Customer profile creation failed');
  }

  // 4. Cleanup used OTP
  await adminSupabase.from('customer_otps').delete().eq('id', otpData.id);

  return { success: true };
}

export async function loginCustomer(formData: FormData): Promise<AuthResult> {
  const rl = await rateLimit(5, 60000);
  if (!rl.success) return { error: rl.error };

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createClient();

  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error('Login failed');
    return { error: 'Invalid email or password.' };
  }

  if (!data.user) {
    return { error: 'Login failed. Please try again.' };
  }

  // Ensure the customer profile exists (self-heal for users who registered before migration)
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('id', data.user.id)
    .single();

  if (!existingCustomer) {
    await supabase.from('customers').insert({
      id: data.user.id,
      email: data.user.email || email,
      full_name: data.user.user_metadata?.full_name || '',
      phone: data.user.user_metadata?.phone || null,
    });
  }

  return { success: true };
}

export async function logoutCustomer(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
