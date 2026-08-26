import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler disabled due to Turbopack Babel crash on Windows
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
  },
};

export default nextConfig;
