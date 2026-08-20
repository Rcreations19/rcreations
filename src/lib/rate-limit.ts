import { headers } from 'next/headers';
import { getServiceRoleClient } from './supabase/server';

export async function rateLimit(limit: number = 5, windowMs: number = 60000) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || '127.0.0.1';

  try {
    const supabase = await getServiceRoleClient();
    
    // Call the atomic rate limiting RPC
    const { data: allowed, error } = await supabase.rpc('check_rate_limit', {
      p_ip: ip,
      p_limit: limit,
      p_window_ms: windowMs
    });

    if (error) {
      console.error('Rate limit RPC failed');
      // Fail open if the database is unreachable to not block legitimate traffic
      return { success: true };
    }

    if (!allowed) {
      return { success: false, error: 'Too many requests. Please try again later.' };
    }

    return { success: true };
  } catch {
    console.error('Rate limit exception');
    // Fail open
    return { success: true };
  }
}
