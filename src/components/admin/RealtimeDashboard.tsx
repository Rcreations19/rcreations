'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  Activity,
  Plus,
  ChevronRight
} from 'lucide-react';

const ModelCard = ({ title, items }: any) => (
  <div className="bg-white border border-[#e5e5ea] rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
    <div className="bg-[#f5f5f7] px-5 py-3 border-b border-[#e5e5ea]">
      <h2 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">{title}</h2>
    </div>
    <div className="divide-y divide-[#e5e5ea]">
      {items.map((item: any, i: number) => (
        <div key={i} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#f5f5f7]/50 transition-colors">
          <Link href={item.listHref} className="text-sm font-medium text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
            {item.name}
          </Link>
          <div className="flex items-center gap-3">
            {item.addHref && (
              <Link href={item.addHref} className="text-[#86868b] hover:text-[#0071e3] transition-colors" title={`Add ${item.name}`}>
                <Plus className="w-4 h-4" />
              </Link>
            )}
            <Link href={item.listHref} className="text-[#86868b] hover:text-[#1d1d1f] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const KPICard = ({ title, value, trend, label, icon: Icon }: any) => (
  <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-sm font-medium text-[#86868b]">{title}</h3>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f7] text-[#1d1d1f]">
        <Icon className="h-5 w-5" />
      </div>
    </div>
    <div>
      <div className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">{value}</div>
      <div className="mt-2 flex items-center text-xs">
        <span className={`font-medium ${trend.startsWith('+') ? 'text-[#34c759]' : trend === 'Live' ? 'text-[#0071e3]' : 'text-[#ff3b30]'}`}>
          {trend}
        </span>
        <span className="ml-2 text-[#86868b]">{label}</span>
      </div>
    </div>
  </div>
);

interface RealtimeDashboardProps {
  initialProductsCount: number;
  initialOrdersCount: number;
  initialRecentOrders: any[];
  initialB2bCount: number;
  initialTotalSales: number;
}

export function RealtimeDashboard({ 
  initialProductsCount, 
  initialOrdersCount, 
  initialRecentOrders,
  initialB2bCount,
  initialTotalSales
}: RealtimeDashboardProps) {
  
  const [ordersCount, setOrdersCount] = useState(initialOrdersCount);
  const [recentOrders, setRecentOrders] = useState(initialRecentOrders);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel('admin-orders-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          setIsUpdating(true);
          setTimeout(() => setIsUpdating(false), 2000);

          setOrdersCount((prev) => prev + 1);
          setRecentOrders((prev) => {
            const newOrder = payload.new;
            return [newOrder, ...prev].slice(0, 10);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-[#86868b] mt-1">Monitor your store&apos;s real-time performance.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white border border-[#e5e5ea] rounded-xl p-1 shadow-sm">
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[#f5f5f7] text-[#1d1d1f]">Today</button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-[#86868b] hover:text-[#1d1d1f]">7D</button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-[#86868b] hover:text-[#1d1d1f]">30D</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Sales" value={`₹${initialTotalSales.toLocaleString('en-IN')}`} trend="Live" label="All Time" icon={DollarSign} />
        <KPICard title="Active Orders" value={ordersCount} trend="Live" label="Requires Fulfillment" icon={ShoppingCart} />
        <KPICard title="Active Products" value={initialProductsCount} trend="Live" label="In Catalog" icon={Package} />
        <KPICard title="B2B Partners" value={initialB2bCount} trend="Live" label="Approved Retailers" icon={Users} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ModelCard 
          title="Catalog Management" 
          items={[
            { name: 'Products', listHref: '/admin/products', addHref: '/admin/products/new' },
            { name: 'Categories', listHref: '/admin/categories', addHref: '/admin/categories/new' },
            { name: 'Frame Options', listHref: '/admin/frame-options' },
          ]}
        />
        <ModelCard 
          title="Commerce & Sales" 
          items={[
            { name: 'Orders', listHref: '/admin/orders' },
            { name: 'Inquiries', listHref: '/admin/inquiries' },
            { name: 'B2B Customers', listHref: '/admin/customers' },
          ]}
        />
        <ModelCard 
          title="System Settings" 
          items={[
            { name: 'Site Configuration', listHref: '/admin/site-settings' },
            { name: 'Users & Roles', listHref: '/admin/users' },
          ]}
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e5ea] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="px-6 py-5 border-b border-[#e5e5ea] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1d1d1f] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#86868b]" /> Recent Activity
            {isUpdating && (
              <span className="ml-2 inline-flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </h2>
          <Link href="/admin/activity-log" className="text-xs font-medium text-[#0071e3] hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-[#e5e5ea]">
          {recentOrders.length === 0 ? (
            <div className="px-5 py-8 flex items-center justify-center">
              <p className="text-sm text-[#595959] italic">No recent orders found.</p>
            </div>
          ) : (
            recentOrders.map((order, i) => (
              <div key={order.id || i} className="px-5 py-4 flex items-center justify-between hover:bg-[#f5f5f5] transition-colors">
                <div>
                  <p className="text-sm font-medium text-[#111111]">
                    Order <span className="font-mono text-xs">#{String(order.id).substring(0, 8)}</span> placed
                  </p>
                  <p className="text-xs text-[#595959] font-mono mt-0.5">₹{order.total_amount || 0} • {order.customer_email || 'Customer'}</p>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#595959]">
                  {order.created_at ? new Date(order.created_at).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
