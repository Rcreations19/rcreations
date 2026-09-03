import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Enforce www canonical domain ──────────────────────────
  const host = request.headers.get('host');
  if (host === 'rcreationframes.com') {
    const url = request.nextUrl.clone();
    url.host = 'www.rcreationframes.com';
    return NextResponse.redirect(url, 301);
  }

  // ── 2. Classify the route ─────────────────────────────────────
  const isAdminRoute    = pathname.startsWith('/admin');
  const isLoginPage     = pathname === '/admin/login';
  const isAccountRoute  = pathname.startsWith('/account');
  const isCheckoutRoute = pathname.startsWith('/checkout');
  const isAuthRoute     = pathname.startsWith('/auth');
  const isProtected     = isAdminRoute || isAccountRoute || isCheckoutRoute || isAuthRoute;

  // ── 3. Public routes — security headers only, ZERO Supabase calls ──
  if (!isProtected) {
    const res = NextResponse.next({ request });
    applySecurityHeaders(res, pathname, false);
    return res;
  }

  // ── 4. Protected routes — initialise Supabase ────────────────
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

  // ── 5. Admin route protection ─────────────────────────────────
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

  // ── 6. Redirect logged-in admin away from login page ─────────
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

  // ── 7. Protect /account routes ────────────────────────────────
  if (isAccountRoute && !user && !supabaseResponse.headers.has('Location')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    supabaseResponse = NextResponse.redirect(url);
  }

  applySecurityHeaders(supabaseResponse, pathname, isProtected);
  return supabaseResponse;
}

// ── Security headers helper ───────────────────────────────────────
function applySecurityHeaders(res: NextResponse, pathname: string, isProtected: boolean) {
  const isDev = process.env.NODE_ENV !== 'production';
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://places.googleapis.com https://maps.googleapis.com${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://*.googleapis.com https://*.gstatic.com https://*.ggpht.com https://*.google.com",
    "connect-src 'self' https://*.supabase.co https://places.googleapis.com https://maps.googleapis.com https://api.postalpincode.in",
    "frame-src 'self' https://maps.google.com https://www.google.com https://*.google.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
  ].join('; ');

  res.headers.set('Content-Security-Policy', cspHeader);
  res.headers.set('X-DNS-Prefetch-Control', 'on');
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self), usb=(), bluetooth=()');

  if (isProtected) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and static assets — middleware runs on pages only
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-touch-icon.png|robots.txt|sitemap.xml|manifest.json|fonts/|images/|products/).*)',
  ],
};
