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
  X
} from 'lucide-react';
import { RCreationLogo } from '@/components/shared/Logo';
import { AdminNotifications } from './AdminNotifications';

const MODELS = [
  { group: 'Overview' },
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
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

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-[#fcfcfc] text-[#111111] font-admin selection:bg-[#0070f3] selection:text-white overflow-hidden">
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SaaS Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#eaeaea] flex flex-col
        transform transition-transform duration-200 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Logo Area */}
        <div className="h-14 flex items-center px-4 border-b border-[#eaeaea] justify-between">
          <RCreationLogo variant="full-horizontal" theme="light" iconSize={24} />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-[#f5f5f5] rounded">
            <X className="w-4 h-4 text-[#595959]" />
          </button>
          <div className="hidden lg:flex w-6 h-6 rounded bg-[#f5f5f5] border border-[#eaeaea] items-center justify-center text-[#595959] shadow-sm">
            <Command className="w-3.5 h-3.5" />
          </div>
        </div>
        
        {/* Global Search */}
        <div className="p-4 border-b border-[#eaeaea]">
          <div className="relative">
            <label htmlFor="admin-search" className="sr-only">Search admin</label>
            <Search className="w-4 h-4 text-[#595959] absolute left-3 top-1/2 -translate-y-1/2" />
            <input id="admin-search" type="text" placeholder="Search..." 
              className="w-full pl-9 pr-3 py-1.5 bg-[#f5f5f5] border border-transparent rounded-md text-xs focus:ring-1 focus:ring-[#0070f3] focus:border-[#0070f3] focus:bg-white transition-all outline-none" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {MODELS.map((item, index) => {
            if (item.group) {
              return (
                <div key={`group-${index}`} className="pt-4 pb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#595959] px-2">{item.group}</p>
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
                className={`flex items-center gap-3 px-2 py-1.5 rounded-md text-sm font-medium transition-colors group ${
                  isActive 
                    ? 'bg-[#f5f5f5] text-[#111111]' 
                    : 'text-[#444444] hover:bg-[#f5f5f5] hover:text-[#111111]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0070f3]' : 'text-[#595959] group-hover:text-[#111111]'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Context */}
        <div className="p-4 border-t border-[#eaeaea]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0070f3] to-[#2aabb0] flex items-center justify-center text-white shadow-inner">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#111111] truncate">{profile?.full_name || 'Admin User'}</p>
              <p className="text-[10px] text-[#595959] font-mono uppercase truncate">{profile?.role || 'Superuser'}</p>
            </div>
          </div>
          
          <form action={async () => {
            const { signOutAdmin } = await import('@/lib/actions/auth');
            await signOutAdmin();
            window.location.href = '/admin/login';
          }}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-transparent border border-[#eaeaea] rounded-md text-xs font-bold text-[#444444] hover:border-[#dc2626] hover:text-[#dc2626] hover:bg-[#dc2626]/5 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Top Navbar */}
        <header className="h-14 bg-white border-b border-[#eaeaea] flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 hover:bg-[#f5f5f5] rounded-md">
              <Menu className="w-5 h-5 text-[#595959]" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#595959]">rcreation</span>
              <span className="text-[#eaeaea]">/</span>
              <span className="font-bold text-[#111111]">Admin Console</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="hidden sm:flex text-xs font-bold text-[#0070f3] hover:underline items-center gap-1">
              View Site <ArrowUpRight className="w-3 h-3" />
            </Link>
            <AdminNotifications />
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-auto bg-[#fcfcfc] p-4 lg:p-6 xl:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
