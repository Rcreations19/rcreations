'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/admin/DataTable';
import { getProducts, deleteProducts } from '@/lib/actions/products';
import { Check, X } from 'lucide-react';

export default function ProductsListPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (ids: string[]) => {
    if (confirm(`Are you sure you want to delete ${ids.length} products?`)) {
      const res = await deleteProducts(ids);
      if (res?.error) {
        alert(res.error);
        return;
      }
      await fetchProducts();
    }
  };

  const columns = [
    {
      header: 'Title',
      cell: (item: any) => (
        <Link href={`/admin/products/${item.id}`} className="font-bold text-[#10164A] hover:text-[#2aabb0] transition-colors">
          {item.title}
        </Link>
      )
    },
    {
      header: 'Category',
      cell: (item: any) => item.category?.name || 'Uncategorized'
    },
    {
      header: 'Retail Price',
      cell: (item: any) => <span className="font-mono text-neutral-600">₹{item.price}</span>
    },
    {
      header: 'Wholesale',
      cell: (item: any) => <span className="font-mono text-emerald-600 font-bold">₹{item.wholesale_price}</span>
    },
    {
      header: 'Bestseller',
      cell: (item: any) => item.is_bestseller ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-neutral-300" />
    },
    {
      header: 'Active',
      cell: (item: any) => item.is_active ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-neutral-300" />
    },
  ];

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#10164A]">Select product to change</h1>
      </div>

      <div className="flex gap-6">
        {/* Main List */}
        <div className="flex-1">
          {loading ? (
            <div className="p-12 text-center text-neutral-500 font-medium">Loading products...</div>
          ) : (
            <DataTable
              data={filteredProducts}
              columns={columns}
              searchQuery={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search products by title or slug..."
              onRowClick={(item) => router.push(`/admin/products/${item.id}`)}
              actions={{
                addHref: '/admin/products/new',
                addLabel: 'Add product',
                onBulkDelete: handleDelete,
              }}
            />
          )}
        </div>

        {/* Django-style Right Sidebar Filters */}
        <div className="w-64 shrink-0 hidden lg:block">
          <div className="bg-white border border-neutral-200 rounded-lg shadow-sm">
            <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200">
              <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Filter</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-neutral-500 mb-2">By Active</h4>
                <ul className="text-sm space-y-1 text-[#10164A]">
                  <li><button className="font-bold hover:text-[#2aabb0]">All</button></li>
                  <li><button className="hover:text-[#2aabb0]">Yes</button></li>
                  <li><button className="hover:text-[#2aabb0]">No</button></li>
                </ul>
              </div>
              <div className="border-t border-neutral-100 pt-4">
                <h4 className="text-xs font-bold text-neutral-500 mb-2">By Bestseller</h4>
                <ul className="text-sm space-y-1 text-[#10164A]">
                  <li><button className="font-bold hover:text-[#2aabb0]">All</button></li>
                  <li><button className="hover:text-[#2aabb0]">Yes</button></li>
                  <li><button className="hover:text-[#2aabb0]">No</button></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
