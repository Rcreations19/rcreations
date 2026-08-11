import type { MetadataRoute } from 'next';
import { getPublicProducts } from '@/lib/actions/storefront';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublicProducts() || [];

  const productRoutes = products.map((product: any) => ({
    url: `https://rcreationframes.com/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://rcreationframes.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://rcreationframes.com/products',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://rcreationframes.com/wholesale',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://rcreationframes.com/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...productRoutes,
  ];
}
