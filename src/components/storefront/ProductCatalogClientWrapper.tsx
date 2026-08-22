'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ProductCatalogClientInner = dynamic(
  () => import('@/components/storefront/ProductCatalogClient'),
  {
    ssr: false,
    // No loading component - we handle loading state manually to avoid SSR mismatch
  }
);

interface ProductCatalogClientProps {
  initialProducts: any[];
  categories: any[];
}

export default function ProductCatalogClient({ initialProducts, categories }: { initialProducts: any[]; categories: any[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-96 flex items-center justify-center">Loading catalog...</div>;
  }

  return <ProductCatalogClientInner initialProducts={initialProducts} categories={categories} />;
}