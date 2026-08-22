'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ProductCatalogClientInner = dynamic(
  () => import('@/components/storefront/ProductCatalogClient'),
  {
    ssr: false,
    // No loading component - we handle loading state in the parent page
  }
);

interface ProductCatalogClientProps {
  initialProducts: any[];
  categories: any[];
}

export default function ProductCatalogClient({ initialProducts, categories }: { initialProducts: any[]; categories: any[] }) {
  // Render nothing on server to avoid SSR mismatch with dynamic import (ssr: false)
  // The dynamic import with ssr: false will only render on client
  if (typeof window === 'undefined') {
    return null;
  }

  return <ProductCatalogClientInner initialProducts={initialProducts} categories={categories} />;
}