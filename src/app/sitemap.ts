import type { MetadataRoute } from 'next';
import { getPublicProducts, getPublicCategories } from '@/lib/actions/storefront';
import { getPublicBlogs } from '@/lib/actions/blogs';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blogs, categories] = await Promise.all([
    getPublicProducts().catch(() => []),
    getPublicBlogs().catch(() => []),
    getPublicCategories().catch(() => []),
  ]);

  const productRoutes = products.map((product: { slug: string, updated_at?: string, created_at?: string }) => ({
    url: `https://www.rcreationframes.com/products/${product.slug}`,
    lastModified: new Date(product.updated_at || product.created_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const blogRoutes = (blogs || []).map((blog: { slug: string, updated_at?: string, created_at?: string }) => ({
    url: `https://www.rcreationframes.com/blogs/${blog.slug}`,
    lastModified: new Date(blog.updated_at || blog.created_at || Date.now()),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const categoryRoutes = (categories || []).map((category: { slug: string, updated_at?: string }) => ({
    url: `https://www.rcreationframes.com/collections/${category.slug}`,
    lastModified: category.updated_at ? new Date(category.updated_at) : undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [
    {
      url: 'https://www.rcreationframes.com',
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.rcreationframes.com/products',
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://www.rcreationframes.com/about',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.rcreationframes.com/wholesale',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://www.rcreationframes.com/configurator',
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: 'https://www.rcreationframes.com/locations/vellore',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://www.rcreationframes.com/blogs',
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: 'https://www.rcreationframes.com/contact',
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://www.rcreationframes.com/specs',
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: 'https://www.rcreationframes.com/terms',
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: 'https://www.rcreationframes.com/privacy',
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    ...productRoutes,
    ...blogRoutes,
    ...categoryRoutes,
  ];
}
