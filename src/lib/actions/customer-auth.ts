'use server';

import { createClient, getServiceRoleClient } from '../supabase/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { rateLimit } from '../rate-limit';

import { ActionResponse, getSafeErrorMessage } from '../utils/action-response';

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

export async function registerCustomer(formData: FormData): Promise<ActionResponse<{ step: string }>> {
  try {
    const rl = await rateLimit(5, 60000); 
    if (!rl.success) throw new Error(rl.error || 'Rate limit exceeded');

    const parsed = registerSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      fullName: formData.get('fullName'),
      phone: formData.get('phone') || undefined,
    });

    const { email, password, fullName, phone } = parsed;
    const supabase = await createClient();

    const { data: existing } = await supabase.from('customers').select('id').eq('email', email).maybeSingle();

    // Generate 6-digit OTP using cryptographically secure random
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const code = (100000 + (arr[0] % 900000)).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    if (!existing) {
      const adminSupabase = await getServiceRoleClient();

      // Upsert in customer_otps table
      const { error: upsertError } = await adminSupabase.from('customer_otps' as any).upsert(
        {
          email,
          code,
          full_name: fullName,
          phone: phone || null,
          expires_at: expiresAt,
          attempts: 0,
        },
        { onConflict: 'email' }
      );

      if (upsertError) {
        throw new Error('Failed to generate security code.');
      }

      // Send Email via Resend
      const resend = new Resend(process.env.RESEND_API_KEY || '');
      await resend.emails.send({
        from: 'R Creation <noreply@rcreationframes.com>',
        to: email,
        subject: 'Verify your R Creation Account',
        html: `<p>Hi ${fullName},</p><p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`
      });
    } else {
      // Anti-Account Enumeration: Simulate the delay to mask existence
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    }

    return { success: true, data: { step: 'otp' } };
  } catch (error) {
    return { success: false, error: getSafeErrorMessage(error, 'Registration failed. Please try again.') };
  }
}

export async function verifyCustomerRegistrationOtp(formData: FormData): Promise<ActionResponse> {
  try {
    const rl = await rateLimit(10, 60000); 
    if (!rl.success) throw new Error(rl.error || 'Rate limit exceeded');

    const parsed = verifyOtpSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      code: formData.get('code'),
    });

    const { email, password, code } = parsed;
    const adminSupabase = await getServiceRoleClient();
    
    // 1. Verify OTP (Anti-Brute Force OTP Burner)
    const { data: otpData, error: otpFetchError } = await adminSupabase
      .from('customer_otps' as any)
      .select('*')
      .eq('email', email)
      .gte('expires_at', new Date().toISOString())
      .single();

    const otp = otpData as any;

    if (otpFetchError || !otp) {
      throw new Error('Invalid or expired code.');
    }

    if (otp.code !== code) {
      // Wrong guess
      if (otp.attempts >= 2) {
        // Burn the OTP completely on 3rd failed attempt
        await adminSupabase.from('customer_otps' as any).delete().eq('id', otp.id);
        throw new Error('Too many failed attempts. Please request a new code.');
      } else {
        // Increment attempt counter
        await adminSupabase.from('customer_otps' as any).update({ attempts: otp.attempts + 1 } as any).eq('id', otp.id);
        throw new Error('Invalid code.');
      }
    }

    const supabase = await createClient();

    // 2. Create the user in Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: otp.full_name,
          is_customer: true,
        },
      },
    });

    if (signUpError) {
      if (signUpError.message?.includes('already registered') || signUpError.code === 'email_exists') {
        const { data: existingUser } = await supabase.auth.signInWithPassword({ email, password });
        if (existingUser?.user) {
          await adminSupabase.from('customers').upsert(
            {
              id: existingUser.user.id,
              email,
              full_name: otp.full_name ?? undefined,
              phone: otp.phone ?? undefined,
            },
            { onConflict: 'id' }
          );
          await adminSupabase.from('customer_otps' as any).delete().eq('id', otp.id);
          return { success: true };
        }
      }
      throw new Error('Registration failed. Please try again.');
    }

    if (!authData.user) {
      throw new Error('Registration failed. Please try again.');
    }

    // 3. Upsert the customer profile
    await adminSupabase.from('customers').upsert(
      {
        id: authData.user.id,
        email,
        full_name: otp.full_name ?? undefined,
        phone: otp.phone ?? undefined,
      },
      { onConflict: 'id' }
    );

    // 4. Cleanup used OTP
    await adminSupabase.from('customer_otps' as any).delete().eq('id', otp.id);

    return { success: true };
  } catch (error) {
    return { success: false, error: getSafeErrorMessage(error, 'Verification failed.') };
  }
}

export async function loginCustomer(formData: FormData): Promise<ActionResponse> {
  try {
    const rl = await rateLimit(5, 60000);
    if (!rl.success) throw new Error(rl.error || 'Rate limit exceeded');

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    const supabase = await createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      throw new Error('Invalid email or password.');
    }

    // Ensure the customer profile exists (self-heal for users who registered before migration)
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (!existingCustomer) {
      await supabase.from('customers').upsert(
        {
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || '',
          phone: data.user.user_metadata?.phone || null,
        },
        { onConflict: 'id' }
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: getSafeErrorMessage(error, 'Login failed.') };
  }
}

export async function logoutCustomer(): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to logout.' };
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
});

export async function requestCustomerPasswordReset(formData: FormData): Promise<ActionResponse> {
  try {
    const rl = await rateLimit(3, 60000);
    if (!rl.success) throw new Error(rl.error || 'Rate limit exceeded');

    const parsed = forgotPasswordSchema.parse({
      email: formData.get('email'),
    });

    const { email } = parsed;
    const supabase = await createClient();
    const adminSupabase = await getServiceRoleClient();

    // Check if customer exists before sending reset
    const { data: existing } = await adminSupabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!existing) {
      // Anti-Account Enumeration: Simulate the delay to mask existence
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      return { success: true };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rcreationframes.com'}/auth/reset-password`,
    });

    if (error) {
      throw new Error('Failed to send reset email. Please try again.');
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: getSafeErrorMessage(error) };
  }
}
