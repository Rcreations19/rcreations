'use client';

import dynamic from 'next/dynamic';

const ProductCatalogClientInner = dynamic(
  () => import('@/components/storefront/ProductCatalogClient'),
  {
    ssr: false,
    loading: () => <div className="h-96 flex items-center justify-center">Loading catalog...</div>,
  }
);

interface ProductCatalogClientProps {
  initialProducts: any[];
  categories: any[];
}

export default function ProductCatalogClient({ initialProducts, categories }: { initialProducts: any[]; categories: any[] }) {
  // Guard against server-side rendering during static HTML generation
  if (typeof window === 'undefined') {
    return <div className="h-96 flex items-center justify-center">Loading catalog...</div>;
  }

  return <ProductCatalogClientInner initialProducts={initialProducts} categories={categories} />;
}