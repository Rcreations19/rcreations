'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, ArrowRight, User, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { RCreationLogo } from '../shared/Logo';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { AnnouncementTicker } from './AnnouncementTicker';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about' },
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

    // Background glass effect (with change guard)
    const nowScrolled = latest > 50;
    setIsScrolled((prev) => {
      if (prev !== nowScrolled) return nowScrolled;
      return prev;
    });

    // Hide/Show logic
    if (latest > 200 && latest > previous && !mobileMenuOpen) {
      setIsHidden(true); // Scrolling down
    } else {
      setIsHidden(false); // Scrolling up
    }
  });

  // Calculate total items (quantities included)
  const cartItemCount = totalCount || 0;

  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('scroll-locked');
    } else {
      document.body.classList.remove('scroll-locked');
    }
    return () => document.body.classList.remove('scroll-locked');
  }, [mobileMenuOpen]);

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
        className={`sticky top-0 left-0 right-0 z-50 transition-shadow duration-500 border-b bg-transparent md:bg-primary md:backdrop-blur-none text-white ${isScrolled
            ? 'border-white/10 md:shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
            : 'border-transparent'
          }`}
      >
        {/* Announcement Bar — rAF-driven ticker (immune to CSS animation overrides) */}
        <AnnouncementTicker />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-500 py-4 md:py-10">

          {/* Brand Logo */}
          <div className="hidden md:flex flex-1 lg:flex-none items-center">
            <Link href="/" className="group flex items-center gap-3 transition-all duration-300 hover:scale-105 -my-6">
              <RCreationLogo variant="full-horizontal" theme="dark" iconSize={80} />
            </Link>
          </div>

          {/* Mobile Search Bar & Menu (Only visible on mobile) */}
          <div className="flex w-full md:hidden items-center mt-1 gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-3 bg-white border border-neutral-200 rounded-xl text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent active:scale-95 transition-all"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <form action="/products" method="GET" className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black z-10 pointer-events-none" />
              <input 
                type="text" 
                name="search" 
                placeholder="Search products..." 
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-neutral-200 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-xl text-neutral-900 text-base placeholder:text-neutral-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
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
                  aria-current={isActive ? 'page' : undefined}
                  className={`text-xs font-bold tracking-widest uppercase transition-all duration-300 relative py-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary group ${isActive ? 'text-accent' : 'text-neutral-300 hover:text-white'
                    }`}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-accent transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex flex-1 lg:flex-none items-center justify-end gap-3">
            <Link href="/products" className="hidden sm:flex text-neutral-300 hover:text-accent transition-colors p-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Search products">
              <Search className="w-5 h-5" />
            </Link>

            {/* Auth Button */}
            {!authLoading && (
              <div className="relative hidden md:block" ref={userMenuRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 p-1.5 text-white hover:text-accent transition-colors group"
                      aria-label="Account menu"
                    >
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-primary text-xs font-black group-hover:scale-110 transition-transform">
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
                    className="flex items-center gap-1.5 p-2 text-neutral-300 hover:text-accent transition-colors group"
                    aria-label="Sign in"
                  >
                    <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </Link>
                )}
              </div>
            )}

            <button
              onClick={openCart}
              className="relative p-3 -m-1 text-white hover:text-accent transition-colors group hidden md:block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Shopping cart, ${cartItemCount} items`}
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <AnimatePresence>
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-accent text-[#10164A] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* B2B CTA - Von Restorff Effect */}
            <Link
              href="/contact"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-accent text-primary text-xs font-bold uppercase tracking-wider rounded overflow-hidden relative group active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            className="fixed inset-0 z-[70] bg-[#10164A]/98 backdrop-blur-xl pt-24 pb-28 px-8 lg:hidden flex flex-col overflow-y-auto"
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-4 -mr-4 -mt-4 text-white/70 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="w-8 h-8" />
            </button>
            <nav className="flex flex-col space-y-4 flex-1 mt-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`text-3xl font-extrabold tracking-tight py-4 w-full min-h-[56px] flex items-center transition-colors ${isActive ? 'text-accent' : 'text-white'
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-8 space-y-3">
              {user ? (
                <>
                  <Link href="/account" className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-2 font-bold uppercase tracking-widest border border-white/10 rounded-xl transition-colors">
                    <User className="w-4 h-4" />
                    My Account
                  </Link>
                  <button onClick={logout} className="w-full py-3.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center gap-2 font-bold uppercase tracking-widest border border-red-500/20 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-2 font-bold uppercase tracking-widest border border-white/10 rounded-xl transition-colors">
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
              <Link 
                href="/contact"
                className="w-full py-4 bg-accent hover:bg-[#2eb1b5] text-primary flex items-center justify-center gap-2 font-bold uppercase tracking-widest rounded-xl shadow-md transition-all"
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
