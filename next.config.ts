import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler disabled due to Turbopack Babel crash on Windows
  images: {
    // Drop AVIF — encoding is CPU-heavy on Cloudflare free tier, WebP is fast + great quality
    formats: ['image/webp'],
    // Tuned to actual product card sizes used across the site
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24h browser cache for optimised images
    localPatterns: [
      { pathname: '/**' },
      { pathname: '/api/secure-image/**' },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
  },
  // Compress all responses — reduces Worker egress on Cloudflare free tier
  compress: true,
  async headers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : '*.supabase.co';
    const isDev = process.env.NODE_ENV !== 'production';
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' https://places.googleapis.com https://maps.googleapis.com${isDev ? " 'unsafe-eval'" : ""}`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              `img-src 'self' data: blob: https://images.unsplash.com https://${supabaseUrl} https://*.googleapis.com https://*.gstatic.com https://*.ggpht.com https://*.google.com`,
              `connect-src 'self' https://${supabaseUrl} https://places.googleapis.com https://maps.googleapis.com https://api.postalpincode.in`,
              "frame-src 'self' https://maps.google.com https://www.google.com https://*.google.com",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "base-uri 'self'"
            ].join('; ')
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self), usb=(), bluetooth=()' }
        ],
      },
      {
        source: '/((?!admin|auth|checkout|api).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200',
          }
        ]
      }
    ];
  },
};

export default nextConfig;
