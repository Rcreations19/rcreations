import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/auth/', '/account/', '/checkout/', '/api/', '/_next/'],
    },
    sitemap: 'https://www.rcreationframes.com/sitemap.xml',
  };
}
