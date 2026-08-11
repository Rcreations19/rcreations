import React from 'react';
import ProductCatalogClient from '@/components/storefront/ProductCatalogClient';
import { getPublicProducts, getPublicCategories } from '@/lib/actions/storefront';

export const revalidate = 3600; // 1 hour ISR

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getPublicProducts(),
    getPublicCategories()
  ]);

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-28 pb-20">
      <ProductCatalogClient 
        initialProducts={products || []} 
        categories={categories || []} 
      />
    </div>
  );
}
