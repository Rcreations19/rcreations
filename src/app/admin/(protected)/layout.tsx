import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Settings, 
  LogOut, 
  FolderTree, 
  Star,
  Activity,
  User,
  Search,
  Bell,
  Command,
  FileText
} from 'lucide-react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { RCreationLogo } from '@/components/shared/Logo';

// SaaS-style model registry navigation
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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Middleware handles redirection for unauthenticated users,
  // so if there's no user, we just return nothing briefly while middleware kicks in.
  if (!user) {
    return null;
  }

  // Fetch admin profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex h-screen bg-[#fcfcfc] text-[#111111] font-admin selection:bg-[#0070f3] selection:text-white overflow-hidden">
      
      {/* SaaS Sidebar */}
      <aside className="w-64 bg-white border-r border-[#eaeaea] flex flex-col relative z-20">
        
        {/* Logo Area */}
        <div className="h-14 flex items-center px-4 border-b border-[#eaeaea] justify-between">
          <RCreationLogo variant="full-horizontal" theme="light" iconSize={24} />
          <div className="w-6 h-6 rounded bg-[#f5f5f5] border border-[#eaeaea] flex items-center justify-center text-[#595959] shadow-sm">
            <Command className="w-3.5 h-3.5" />
          </div>
        </div>
        
        {/* Global Search */}
        <div className="p-4 border-b border-[#eaeaea]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#595959] absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search..." 
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

            const Icon = item.icon as any;
            return (
              <Link 
                key={item.href} 
                href={item.href || "#"}
                className="flex items-center gap-3 px-2 py-1.5 rounded-md text-sm font-medium text-[#444444] hover:bg-[#f5f5f5] hover:text-[#111111] transition-colors group"
              >
                <Icon className="w-4 h-4 text-[#595959] group-hover:text-[#111111]" />
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
            'use server';
            const { signOutAdmin } = await import('@/lib/actions/auth');
            await signOutAdmin();
            const { redirect } = await import('next/navigation');
            redirect('/admin/login');
          }}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-transparent border border-[#eaeaea] rounded-md text-xs font-bold text-[#444444] hover:border-[#dc2626] hover:text-[#dc2626] hover:bg-[#dc2626]/5 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Top Navbar */}
        <header className="h-14 bg-white border-b border-[#eaeaea] flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#595959]">rcreation</span>
            <span className="text-[#eaeaea]">/</span>
            <span className="font-bold text-[#111111]">Admin Console</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-xs font-bold text-[#0070f3] hover:underline flex items-center gap-1">
              View Site <ArrowUpRight className="w-3 h-3" />
            </Link>
            <button className="w-8 h-8 rounded-full hover:bg-[#f5f5f5] flex items-center justify-center text-[#595959] transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-[#dc2626] rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-auto bg-[#fcfcfc] p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

// Inline Icon to avoid adding another import right now
const ArrowUpRight = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
);
