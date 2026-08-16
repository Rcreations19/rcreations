'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Frame, User, ShoppingCart } from 'lucide-react';
import { useCart } from './CartContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalCount, openCart } = useCart();

  const handleVibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Catalog', href: '/products', icon: LayoutGrid },
    { name: 'Config', href: '/configurator', icon: Frame },
    { name: 'Account', href: '/account', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-2 left-2 right-2 z-[60] bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around px-2 h-[4.5rem]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={handleVibrate}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all duration-300 rounded-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive ? 'text-[#2aabb0]' : 'text-neutral-500'
              }`}
            >
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-[#2aabb0] rounded-full" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'fill-[#2aabb0]/10 stroke-2' : 'stroke-[1.5]'}`} />
              <span className={`text-[10px] leading-none tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
            </Link>
          );
        })}
        
        <button 
          onClick={() => {
            handleVibrate();
            openCart();
          }}
          aria-label={`Shopping cart, ${totalCount} items`}
          className="relative flex flex-col items-center justify-center w-full h-full space-y-1.5 text-neutral-500 transition-all duration-300 rounded-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#2aabb0] text-[#0a0e27] text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm border border-white">
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium leading-none tracking-wide">Cart</span>
        </button>
      </div>
    </div>
  );
}
