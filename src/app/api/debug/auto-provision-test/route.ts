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

  // First try sign in
  const { data, error: signInError } = await statelessSupabase.auth.signInWithPassword({ email, password });

  if (signInError && isEnvAdmin) {
    // Try auto-provisioning
    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
      email, password, email_confirm: true
    });

    if (createError) {
      return NextResponse.json({
        step: 'auto-provision',
        createUserError: { code: createError.code, message: createError.message },
      });
    }

    // Retry sign in
    const retry = await statelessSupabase.auth.signInWithPassword({ email, password });
    return NextResponse.json({
      step: 'auto-provision-retry',
      retryError: retry.error ? { code: retry.error.code, message: retry.error.message } : null,
      hasSession: !!retry.data?.session,
      userId: retry.data?.user?.id || null,
    });
  }

  return NextResponse.json({
    step: 'initial-signin',
    signInError: signInError ? { code: signInError.code, message: signInError.message } : null,
    hasSession: !!data?.session,
    userId: data?.user?.id || null,
    isEnvAdmin,
  });
}