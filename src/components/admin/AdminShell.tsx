"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Settings, 
  LogOut, 
  FolderTree, 
  Activity,
  User,
  Search,
  Bell,
  Command,
  FileText,
  ArrowUpRight,
  Menu,
  X,
  Star
} from 'lucide-react';
import { RCreationLogo } from '@/components/shared/Logo';
import { AdminNotifications } from './AdminNotifications';

const MODELS = [
  { group: 'Overview' },
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Abandoned Carts', href: '/admin/abandoned-carts', icon: ShoppingCart },
  { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { group: 'Catalog' },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Frame Options', href: '/admin/frame-options', icon: Settings },
  { name: 'Blogs', href: '/admin/blogs', icon: FileText },
  { group: 'System' },
  { name: 'Site Settings', href: '/admin/site-settings', icon: Settings },
  { name: 'Activity Log', href: '/admin/activity-log', icon: Activity },
];

interface AdminShellProps {
  children: React.ReactNode;
  profile: { full_name: string | null; role: string | null } | null;
}

export function AdminShell({ children, profile }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState(pathname);

  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans selection:bg-[#0071e3] selection:text-white overflow-hidden">
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SaaS Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white/80 backdrop-blur-xl border-r border-[#e5e5ea] flex flex-col
        transform transition-transform duration-200 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Logo Area */}
        <div className="h-14 flex items-center px-6 border-b border-[#e5e5ea] justify-between">
          <RCreationLogo variant="full-horizontal" theme="light" iconSize={24} />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-[#f5f5f5] rounded">
            <X className="w-4 h-4 text-[#595959]" />
          </button>
          <div className="hidden lg:flex w-6 h-6 rounded-md bg-[#f5f5f7] border border-[#e5e5ea] items-center justify-center text-[#86868b] shadow-sm">
            <Command className="w-3.5 h-3.5" />
          </div>
        </div>
        
        {/* Global Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <label htmlFor="admin-search" className="sr-only">Search admin</label>
            <Search className="w-4 h-4 text-[#595959] absolute left-3 top-1/2 -translate-y-1/2" />
            <input id="admin-search" type="text" placeholder="Search..." 
              className="w-full pl-9 pr-3 py-1.5 bg-[#f5f5f7] border border-transparent rounded-lg text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:border-[#d2d2d7] focus:ring-4 focus:ring-[#0071e3]/10 transition-all outline-none" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {MODELS.map((item, index) => {
            if (item.group) {
              return (
                <div key={`group-${index}`} className="pt-4 pb-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] px-3">{item.group}</p>
                </div>
              );
            }

            const Icon = item.icon!;
            const href = item.href || '#';
            const isActive = pathname === href || (href !== '/admin' && href !== '#' && pathname.startsWith(href));
            return (
              <Link 
                key={href} 
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-[#0071e3] text-white shadow-sm' 
                    : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#86868b] group-hover:text-[#1d1d1f]'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Context */}
        <div className="p-4 border-t border-[#e5e5ea]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-[#f5f5f7] border border-[#e5e5ea] flex items-center justify-center text-[#1d1d1f] shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1d1d1f] truncate">{profile?.full_name || 'Admin User'}</p>
              <p className="text-[11px] text-[#86868b] truncate">{profile?.role || 'Superuser'}</p>
            </div>
          </div>
          
          <form action={async () => {
            const { signOutAdmin } = await import('@/lib/actions/auth');
            await signOutAdmin();
            window.location.href = '/admin/login';
          }}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-[#e5e5ea] shadow-sm rounded-lg text-sm font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] hover:text-[#ff3b30] transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Top Navbar */}
        <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-[#e5e5ea] flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 hover:bg-[#f5f5f7] rounded-md transition-colors">
              <Menu className="w-5 h-5 text-[#1d1d1f]" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#86868b] font-medium">rcreation</span>
              <span className="text-[#d2d2d7]">/</span>
              <span className="font-semibold text-[#1d1d1f]">Admin Console</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/" target="_blank" className="hidden sm:flex text-sm font-medium text-[#0071e3] hover:underline items-center gap-1 transition-all">
              View Site <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <AdminNotifications />
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-auto bg-surface p-4 lg:p-6 xl:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
