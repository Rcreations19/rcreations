import { NextResponse } from 'next/server';

function mask(val: string | undefined): string {
  if (!val) return 'MISSING';
  if (val.length <= 8) return '***SET***';
  return val.substring(0, 4) + '...' + val.substring(val.length - 4);
}

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: mask(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: mask(process.env.SUPABASE_SERVICE_ROLE_KEY),
    ADMIN_EMAIL: mask(process.env.ADMIN_EMAIL),
    ADMIN_PASSWORD: mask(process.env.ADMIN_PASSWORD),
    RESEND_API_KEY: mask(process.env.RESEND_API_KEY),
    NODE_ENV: process.env.NODE_ENV || 'MISSING',
  });
}
