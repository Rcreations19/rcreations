import React, { Suspense } from 'react';
import ProductCatalogClient from '@/components/storefront/ProductCatalogClient';
import { getPublicProducts, getPublicCategories } from '@/lib/actions/storefront';

export const revalidate = 3600; // 1 hour ISR

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getPublicProducts(),
    getPublicCategories()
  ]);

  return (
    <div className="bg-transparent min-h-screen pt-8 md:pt-28 pb-20">
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading catalog...</div>}>
        <ProductCatalogClient 
          initialProducts={products || []} 
          categories={categories || []} 
        />
      </Suspense>
    </div>
  );
}
