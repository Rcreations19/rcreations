import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './types';

/**
 * Lightweight public client for anonymous queries (products, blogs, categories).
 * Does NOT use cookies — safe for server components in OpenNext/Cloudflare Workers.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

/**
 * WARNING: This client bypasses all Row Level Security (RLS) policies.
 * It should ONLY be used in secure Server Actions or Route Handlers 
 * where you have already validated the user's intent or need to perform
 * system-level operations (like creating guest orders).
 * NEVER expose this to the client.
 */
export async function getServiceRoleClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use the service role key
    {
      cookies: {
        getAll() {
          return []; // Do NOT read user cookies, or it will downgrade to user privileges
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          // Ignored
        },
      },
    }
  );
}

/**
 * Helper to create a client for admin actions.
 * Verifies that the current user is authenticated and has the admin role.
 * Throws an error if unauthorized.
 */
export async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin' || !profile.is_active) {
    throw new Error('Admin privileges required');
  }

  return supabase;
}

export async function verifyAdmin() {
  await getAdminClient();
  return true;
}
