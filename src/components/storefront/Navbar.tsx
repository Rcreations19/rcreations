'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, Menu, X, ArrowRight, User, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { RCreationLogo } from '../shared/Logo';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Catalog', href: '/products' },
  { name: 'Wholesale B2B', href: '/wholesale' },
  { name: 'Custom Build', href: '/configurator' },
  { name: 'Blogs', href: '/blogs' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const { totalCount, openCart } = useCart();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { scrollY } = useScroll();

  // Smart auto-hide navbar
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    // Background glass effect
    setIsScrolled(latest > 50);

    // Hide/Show logic
    if (latest > 200 && latest > previous && !mobileMenuOpen) {
      setIsHidden(true); // Scrolling down
    } else {
      setIsHidden(false); // Scrolling up
    }
  });

  // Calculate total items (quantities included)
  const cartItemCount = totalCount || 0;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus trap for mobile menu
  const getFocusableElements = useCallback(() => {
    if (!mobileMenuRef.current) return [];
    return Array.from(mobileMenuRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = getFocusableElements();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    mobileMenuRef.current?.querySelector<HTMLElement>('a')?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, getFocusableElements]);

  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-500 border-b bg-[#050714]/85 backdrop-blur-md md:bg-[#050714] md:backdrop-blur-none text-white ${isScrolled
            ? 'border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
            : 'border-transparent'
          }`}
      >
        {/* Announcement Bar */}
        <div className="w-full bg-[#2aabb0] text-[#0a0e27] overflow-hidden py-3 cursor-pointer flex items-center">
          {[1, 2].map((marqueeGroup) => (
            <div key={marqueeGroup} className="animate-marquee whitespace-nowrap text-xs font-bold uppercase tracking-widest flex items-center shrink-0" aria-hidden={marqueeGroup === 2}>
              {Array.from({ length: 12 }).map((_, i) => (
                <React.Fragment key={i}>
                  <span className="mx-6">Latest Offers</span> <span className="opacity-60">•</span>
                  <span className="mx-6">Latest Designs</span> <span className="opacity-60">•</span>
                  <span className="mx-6">Local Delivery (40km Radius)</span> <span className="opacity-60">•</span>
                  <span className="mx-6">Cash on Delivery (COD)</span> <span className="opacity-60">•</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-500 py-10">

          {/* Brand Logo */}
          <div className="hidden md:flex flex-1 lg:flex-none items-center">
            <Link href="/" className="group flex items-center gap-3 transition-all duration-300 hover:scale-105 -my-6">
              <RCreationLogo variant="full-horizontal" theme="dark" iconSize={80} />
            </Link>
          </div>

          {/* Mobile Search Bar (Only visible on mobile) */}
          <div className="flex w-full md:hidden items-center">
            <form action="/products" method="GET" className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                name="search" 
                placeholder="Search products..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl text-white text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#2aabb0] focus:bg-white/10 transition-all"
              />
            </form>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-bold tracking-widest uppercase transition-all duration-300 relative py-2 group ${isActive ? 'text-[#2aabb0]' : 'text-neutral-300 hover:text-white'
                    }`}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-[#2aabb0] transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex flex-1 lg:flex-none items-center justify-end gap-3">
            <Link href="/products" className="hidden sm:flex text-neutral-300 hover:text-[#2aabb0] transition-colors p-2" aria-label="Search products">
              <Search className="w-5 h-5" />
            </Link>

            {/* Auth Button */}
            {!authLoading && (
              <div className="relative hidden md:block" ref={userMenuRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 p-1.5 text-white hover:text-[#2aabb0] transition-colors group"
                      aria-label="Account menu"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#2aabb0] flex items-center justify-center text-[#0a0e27] text-xs font-black group-hover:scale-110 transition-transform">
                        {userInitial}
                      </div>
                      <ChevronDown className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden z-50"
                        >
                          <div className="px-4 py-3 border-b border-neutral-100">
                            <p className="text-sm font-bold text-[#10164A] truncate">{user.full_name || 'Customer'}</p>
                            <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
                          </div>
                          <div className="py-1">
                            <Link href="/account" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                              <User className="w-4 h-4 text-neutral-400" />
                              My Account
                            </Link>
                            <button
                              onClick={logout}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-1.5 p-2 text-neutral-300 hover:text-[#2aabb0] transition-colors group"
                    aria-label="Sign in"
                  >
                    <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </Link>
                )}
              </div>
            )}

            <button
              onClick={openCart}
              className="relative p-3 -m-1 text-white hover:text-[#2aabb0] transition-colors group hidden md:block"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <AnimatePresence>
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute 0 right-0 top-0 bg-[#2aabb0] text-[#10164A] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* B2B CTA - Von Restorff Effect */}
            <Link
              href="/contact"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#2aabb0] text-[#0a0e27] text-xs font-bold uppercase tracking-wider rounded overflow-hidden relative group"
            >
              <div className="absolute inset-0 w-0 bg-white transition-all duration-[250ms] ease-out group-hover:w-full opacity-20"></div>
              <span className="relative">Inquire</span>
              <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
            </Link>

          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#0a0e27]/95 backdrop-blur-xl pt-24 pb-6 px-6 lg:hidden flex flex-col"
          >
            <nav className="flex flex-col space-y-6 flex-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-2xl font-extrabold tracking-tight ${isActive ? 'text-[#2aabb0]' : 'text-white'
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto space-y-3">
              {user ? (
                <>
                  <Link href="/account" className="w-full py-3 text-white text-center font-bold uppercase tracking-widest block border border-white/20 rounded">
                    My Account
                  </Link>
                  <button onClick={logout} className="w-full py-3 text-red-400 text-center font-bold uppercase tracking-widest border border-red-400/20 rounded">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="w-full py-3 text-white text-center font-bold uppercase tracking-widest block border border-white/20 rounded">
                  Sign In
                </Link>
              )}
              <Link
                href="/contact"
                className="w-full py-4 bg-[#2aabb0] text-[#0a0e27] text-center font-bold uppercase tracking-widest rounded shadow-[0_0_20px_rgba(56,200,204,0.3)] block"
              >
                Contact Sales
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
