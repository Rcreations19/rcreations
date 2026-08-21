import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Auth check — wrapped in try/catch so the site never crashes from middleware
  let user: { id: string } | null = null;
  let supabase: ReturnType<typeof createServerClient> | null = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Middleware] Missing env vars', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
      });
    } else {
      supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      const { data } = await supabase.auth.getUser();
      user = data.user;
    }
  } catch (err) {
    console.error('[Middleware] Auth init failed', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
  }

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';
  const isAccountRoute = pathname.startsWith('/account');
  const isCheckoutRoute = pathname.startsWith('/checkout');
  const isAuthRoute = pathname.startsWith('/auth');

  // Protect admin routes (only if auth succeeded)
  if (supabase && isAdminRoute && !isLoginPage) {
    try {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        url.searchParams.set('redirectTo', pathname);
        supabaseResponse = NextResponse.redirect(url);
      } else {
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
      }
    } catch (err) {
      console.error('[Middleware] Admin auth check failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Redirect logged-in admin from login page to dashboard
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
    } catch (err) {
      console.error('[Middleware] Login redirect check failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Protect /account routes (only if auth succeeded)
  if (isAccountRoute && !user && !supabaseResponse.headers.has('Location')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    supabaseResponse = NextResponse.redirect(url);
  }

  // Security headers — always applied regardless of auth status
  const isDev = process.env.NODE_ENV !== 'production';
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://places.googleapis.com https://maps.googleapis.com ${isDev ? "'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://*.googleapis.com https://*.gstatic.com https://*.ggpht.com https://*.google.com;
    connect-src 'self' https://*.supabase.co https://places.googleapis.com https://maps.googleapis.com;
    frame-src 'self' https://maps.google.com https://www.google.com https://*.google.com;
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
  `.replace(/\s{2,}/g, ' ').trim();

  supabaseResponse.headers.set('Content-Security-Policy', cspHeader);
  supabaseResponse.headers.set('X-DNS-Prefetch-Control', 'on');
  supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block');
  supabaseResponse.headers.set('X-Frame-Options', 'DENY');
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
  supabaseResponse.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  if (isAdminRoute || isAccountRoute || isCheckoutRoute || isAuthRoute) {
    supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
