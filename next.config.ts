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
};

export default nextConfig;
