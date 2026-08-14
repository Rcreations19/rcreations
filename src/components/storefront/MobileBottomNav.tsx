'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Frame, User, ShoppingCart } from 'lucide-react';
import { useCart } from './CartContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalCount, openCart } = useCart();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Catalog', href: '/products', icon: LayoutGrid },
    { name: 'Config', href: '/configurator', icon: Frame },
    { name: 'Account', href: '/account', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-neutral-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-[#2aabb0]' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-[22px] h-[22px]" />
              <span className="text-[10px] font-medium leading-none">{item.name}</span>
            </Link>
          );
        })}
        
        <button 
          onClick={openCart}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-neutral-500 hover:text-neutral-900 relative transition-colors"
        >
          <div className="relative">
            <ShoppingCart className="w-[22px] h-[22px]" />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#2aabb0] text-[#0a0e27] text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium leading-none">Cart</span>
        </button>
      </div>
    </div>
  );
}
