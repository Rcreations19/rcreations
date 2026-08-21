import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD_HASH: !!process.env.ADMIN_PASSWORD_HASH,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    GOOGLE_PLACES_API_KEY: !!process.env.GOOGLE_PLACES_API_KEY,
    NODE_ENV: process.env.NODE_ENV ?? 'undefined',
  });
}
