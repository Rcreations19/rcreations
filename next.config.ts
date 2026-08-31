import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler disabled due to Turbopack Babel crash on Windows
  images: {
    formats: ['image/avif', 'image/webp'],
    localPatterns: [
      {
        pathname: '/**',
      },
      {
        pathname: '/api/secure-image/**',
      },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
  },
};

export default nextConfig;
