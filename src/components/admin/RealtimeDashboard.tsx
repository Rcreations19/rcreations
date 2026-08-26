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
  Plus
} from 'lucide-react';

// Vercel-style Model Card
function ModelCard({ title, items, href }: { title: string, items: { name: string, addHref?: string, listHref: string }[], href?: string }) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm transition-all hover:shadow-md">
      <div className="px-5 py-4 border-b border-border bg-surface flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#111111]">
          {href ? <Link href={href} className="hover:text-[#0070f3] transition-colors">{title}</Link> : title}
        </h2>
      </div>
      <div className="divide-y divide-[#eaeaea]">
        {items.map((item, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#f5f5f5] transition-colors group">
            <Link href={item.listHref} className="text-sm font-medium text-[#444444] group-hover:text-[#111111] transition-colors">
              {item.name}
            </Link>
            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.addHref && (
                <Link href={item.addHref} className="text-[10px] font-bold uppercase tracking-wider text-[#0070f3] hover:text-[#005cc5] flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add
                </Link>
              )}
              <Link href={item.listHref} className="text-[10px] font-bold uppercase tracking-wider text-[#595959] hover:text-[#111111]">
                Manage
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// KPI Card
interface KPICardProps {
  title: string;
  value: string | number;
  trend: string;
  label: string;
  icon: any;
  isUpdating?: boolean;
}

function KPICard({ title, value, trend, label, icon: Icon, isUpdating = false }: KPICardProps) {
  return (
    <div className={`bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col relative overflow-hidden group transition-all duration-300 ${isUpdating ? 'ring-2 ring-emerald-500 scale-[1.02]' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-[#595959] uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-md transition-colors ${isUpdating ? 'bg-emerald-500 text-white' : 'bg-[#f5f5f5] text-[#444444] group-hover:bg-[#0070f3] group-hover:text-white'}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-end">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-[#111111] font-mono tracking-tight">{value}</span>
          <span className="text-[10px] font-bold uppercase text-[#059669] flex items-center">
            <ArrowUpRight className="w-3 h-3" /> {trend}
          </span>
        </div>
        <p className="text-[10px] text-[#595959] font-mono mt-1">{label}</p>
      </div>
    </div>
  );
}

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
    // We use Browser Client for secure client-side Realtime connection.
    // This connects using the current user's secure session JWT token.
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Subscribe to INSERT events on the orders table
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
          // Trigger visual flash
          setIsUpdating(true);
          setTimeout(() => setIsUpdating(false), 2000);

          // Update counts and activity feed instantly
          setOrdersCount((prev) => prev + 1);
          setRecentOrders((prev) => {
            const newOrder = payload.new;
            return [newOrder, ...prev].slice(0, 10); // Keep last 10
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Sales" value={`₹${initialTotalSales.toLocaleString('en-IN')}`} trend="Live" label="All Time" icon={DollarSign} />
        <KPICard title="Active Orders" value={ordersCount} trend="Live" label="Requires Fulfillment" icon={ShoppingCart} isUpdating={isUpdating} />
        <KPICard title="Active Products" value={initialProductsCount} trend="Live" label="In Catalog" icon={Package} />
        <KPICard title="B2B Partners" value={initialB2bCount} trend="Live" label="Approved Retailers" icon={Users} />
      </div>

      {/* Django-style Registry Grid (Re-styled) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ModelCard 
          title="Catalog Management" 
          items={[
            { name: 'Products', listHref: '/admin/products', addHref: '/admin/products/add' },
            { name: 'Categories', listHref: '/admin/categories', addHref: '/admin/categories/add' },
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

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border bg-surface flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#595959]" /> Recent Activity
            {isUpdating && (
              <span className="ml-2 inline-flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </h2>
          <Link href="/admin/activity-log" className="text-[10px] font-bold uppercase tracking-wider text-[#0070f3] hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-[#eaeaea]">
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
    </>
  );
}
