import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Classify the route ─────────────────────────────────────
  const isAdminRoute    = pathname.startsWith('/admin');
  const isLoginPage     = pathname === '/admin/login';
  const isAccountRoute  = pathname.startsWith('/account');

  // ── 2. Initialise Supabase ────────────────
  let supabaseResponse = NextResponse.next({ request });
  let user: { id: string } | null = null;
  let supabase: ReturnType<typeof createServerClient> | null = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Middleware] CRITICAL: Supabase env vars missing');
      if (isAdminRoute && !isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        url.searchParams.set('error', 'auth_unavailable');
        return NextResponse.redirect(url);
      }
    } else {
      supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });
      // Single JWT decode — no DB round-trip
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }
  } catch (err) {
    console.error('[Middleware] Auth init threw', err instanceof Error ? err.message : String(err));
    if (isAdminRoute && !isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('error', 'auth_unavailable');
      return NextResponse.redirect(url);
    }
  }

  // ── 3. Admin route protection ─────────────────────────────────
  if (isAdminRoute && !isLoginPage) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirectTo', pathname);
      supabaseResponse = NextResponse.redirect(url);
    } else if (supabase) {
      // Only check profile role for admin pages (single targeted DB call)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_active')
          .eq('id', user.id)
          .single();
        if (!profile || profile.role !== 'admin' || !profile.is_active) {
          const url = request.nextUrl.clone();
          url.pathname = '/admin/login';
          url.searchParams.set('error', 'unauthorized');
          supabaseResponse = NextResponse.redirect(url);
        }
      } catch (err) {
        console.error('[Middleware] Admin role check failed', err instanceof Error ? err.message : String(err));
      }
    }
  }

  // ── 4. Redirect logged-in admin away from login page ─────────
  if (supabase && isLoginPage && user && !supabaseResponse.headers.has('Location')) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', user.id)
        .single();
      if (profile?.role === 'admin' && profile?.is_active) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        supabaseResponse = NextResponse.redirect(url);
      }
    } catch { /* non-fatal */ }
  }

  // ── 5. Protect /account routes ────────────────────────────────
  if (isAccountRoute && !user && !supabaseResponse.headers.has('Location')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    supabaseResponse = NextResponse.redirect(url);
  }

  // ── 6. Prevent indexing of protected routes ───────────────────
  supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/checkout/:path*',
    '/auth/:path*'
  ],
};
