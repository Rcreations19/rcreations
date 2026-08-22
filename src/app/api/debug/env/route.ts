import { NextResponse } from 'next/server';

export async function GET() {
  const envEmail = process.env.ADMIN_EMAIL?.trim();
  const envPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    adminEmailSet: !!envEmail,
    adminEmailValue: envEmail ? envEmail.substring(0, 5) + '...' : null,
    adminPasswordHashSet: !!envPasswordHash,
    adminPasswordHashPrefix: envPasswordHash ? envPasswordHash.substring(0, 10) + '...' : null,
    supabaseUrlSet: !!supabaseUrl,
    supabaseAnonKeySet: !!supabaseAnonKey,
    serviceRoleKeySet: !!serviceRoleKey,
  });
}
