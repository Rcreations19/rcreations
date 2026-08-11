import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Admin/service-role Supabase client.
 * WARNING: This bypasses RLS policies — use only in server-side contexts
 * for admin operations that require elevated privileges.
 * DEPRECATED: Please use getServiceRoleClient in server.ts instead,
 * which is integrated with Next.js cookies where applicable.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
