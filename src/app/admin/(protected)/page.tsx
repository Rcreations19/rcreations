import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { RealtimeDashboard } from '@/components/admin/RealtimeDashboard';

export const metadata = {
  title: 'Admin Dashboard | R Creation',
};

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  // Fetch quick stats securely from server
  const [
    { count: productsCount },
    { count: ordersCount },
    { data: recentOrders },
    { count: b2bCount },
    { data: salesData }
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('b2b_customers').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total_amount').neq('status', 'cancelled')
  ]);

  const totalSales = salesData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">Site Administration</h1>
        <p className="text-sm text-[#595959] mt-1">Manage catalog, orders, and system settings.</p>
      </div>

      <RealtimeDashboard 
        initialProductsCount={productsCount || 0}
        initialOrdersCount={ordersCount || 0}
        initialRecentOrders={recentOrders || []}
        initialB2bCount={b2bCount || 0}
        initialTotalSales={totalSales}
      />

    </div>
  );
}
