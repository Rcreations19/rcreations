'use server';

import { createClient, getServiceRoleClient } from '../supabase/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { rateLimit } from '../rate-limit';
import { createHash } from 'node:crypto';

// Helper for premium email template
const getOtpEmailHtml = (code: string, title: string, subtitle: string) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px 20px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <img src="https://rcreationframes.com/logo.svg" alt="R Creation" style="height: 48px; width: auto;" />
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

import { ActionResponse, getSafeErrorMessage } from '../utils/action-response';

const registerSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(255, 'Password is too long'),
  fullName: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  phone: z.string().max(20, 'Phone is too long').optional(),
}).strict();

const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email is too long'),
  password: z.string().min(1, 'Password is required').max(255, 'Password is too long'),
}).strict();

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(255),
  code: z.string().length(6, 'OTP must be exactly 6 digits'),
}).strict();


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

    const { email, fullName, phone } = parsed;
    const supabase = await createClient();

    const { data: existing } = await supabase.from('customers').select('id').eq('email', email).maybeSingle();

    // Generate 6-digit OTP using cryptographically secure random
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const code = (100000 + (arr[0] % 900000)).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    if (!existing) {
      const adminSupabase = (await getServiceRoleClient()) as any;

      const hashedCode = createHash('sha256').update(code).digest('hex');

      // @ts-ignore
      const { error: upsertError } = await (adminSupabase as any).from('customer_otps').upsert(
        {
          email,
          code: hashedCode,
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
        html: getOtpEmailHtml(
          code, 
          'Verify Your Email', 
          `Hi ${fullName}, please use the following verification code to complete your registration.`
        )
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
    const adminSupabase = (await getServiceRoleClient()) as any;
    
    // 1. Verify OTP (Anti-Brute Force OTP Burner)
    // @ts-ignore
    const { data: otpData, error: otpFetchError } = await adminSupabase
      .from('customer_otps')
      .select('*')
      .eq('email', email)
      .gte('expires_at', new Date().toISOString())
      .single();

    const otp = otpData as { id: string, code: string, attempts: number, full_name: string | null, phone: string | null };

    if (otpFetchError || !otp) {
      throw new Error('Invalid or expired code.');
    }

    const hashedInput = createHash('sha256').update(code).digest('hex');

    if (otp.code !== hashedInput) {
      // Wrong guess
      if (otp.attempts >= 2) {
        // @ts-ignore
        await (adminSupabase as any).from('customer_otps').delete().eq('id', otp.id);
        throw new Error('Too many failed attempts. Please request a new code.');
      } else {
        // @ts-ignore
        await (adminSupabase as any).from('customer_otps').update({ attempts: otp.attempts + 1 } as never).eq('id', otp.id);
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
          // @ts-ignore
          await (adminSupabase as any).from('customer_otps').delete().eq('id', otp.id);
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

    // @ts-ignore
    await (adminSupabase as any).from('customer_otps').delete().eq('id', otp.id);

    return { success: true };
  } catch (error) {
    return { success: false, error: getSafeErrorMessage(error, 'Verification failed.') };
  }
}

export async function loginCustomer(formData: FormData): Promise<ActionResponse> {
  try {
    const rl = await rateLimit(5, 60000);
    if (!rl.success) throw new Error(rl.error || 'Rate limit exceeded');

    const parsed = loginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0].message);
    }
    const { email, password } = parsed.data;

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
  } catch {
    return { success: false, error: 'Failed to logout.' };
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
}).strict();

export async function requestCustomerPasswordReset(formData: FormData): Promise<ActionResponse> {
  try {
    const rl = await rateLimit(3, 60000);
    if (!rl.success) throw new Error(rl.error || 'Rate limit exceeded');

    const parsed = forgotPasswordSchema.parse({
      email: formData.get('email'),
    });

    const { email } = parsed;
    const supabase = await createClient();
    const adminSupabase = (await getServiceRoleClient()) as any;

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
