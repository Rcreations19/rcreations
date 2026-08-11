'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, ArrowRight } from 'lucide-react';
import { RCreationLogo } from '../shared/Logo';

export default function Footer() {
  return (
    <footer className="bg-[#0a0e27]/90 backdrop-blur-xl text-white pt-20 pb-10 border-t border-white/10 relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2aabb0] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-6">
            <RCreationLogo variant="full-horizontal" theme="dark" iconSize={40} />
            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
              South India's premier manufacturer of synthetic photo frames, optic crystal trophies, and customized wooden mementos. Factory-direct pricing since 2015.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-300 hover:bg-[#2aabb0] hover:text-[#050714] transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-300 hover:bg-[#2aabb0] hover:text-[#050714] transition-all">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-[10px] font-bold text-[#2aabb0] uppercase tracking-widest mb-6 font-mono">Catalog</h3>
            <ul className="space-y-4">
              <li><Link href="/products" className="text-sm text-neutral-400 hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/products?category=frames" className="text-sm text-neutral-400 hover:text-white transition-colors">Photo Frames</Link></li>
              <li><Link href="/products?category=trophies" className="text-sm text-neutral-400 hover:text-white transition-colors">Crystal Trophies</Link></li>
              <li><Link href="/products?category=gifts" className="text-sm text-neutral-400 hover:text-white transition-colors">Custom Gifts</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[10px] font-bold text-[#2aabb0] uppercase tracking-widest mb-6 font-mono">Company</h3>
            <ul className="space-y-4">
              <li><Link href="/wholesale" className="text-sm text-neutral-400 hover:text-white transition-colors">B2B Wholesale</Link></li>
              <li><Link href="/configurator" className="text-sm text-neutral-400 hover:text-white transition-colors">Frame Builder</Link></li>
              <li><Link href="/specs" className="text-sm text-neutral-400 hover:text-white transition-colors">Tech Specs</Link></li>
              <li><Link href="/admin/login" className="text-sm text-neutral-400 hover:text-[#2aabb0] transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="lg:col-span-4">
            <h3 className="text-[10px] font-bold text-[#2aabb0] uppercase tracking-widest mb-6 font-mono">Factory Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-neutral-400">
                <MapPin className="w-4 h-4 text-[#2aabb0] shrink-0 mt-1" />
                <span className="leading-relaxed">R Creation, Gudiyattam,<br />Vellore District, Tamil Nadu — 632602</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <Phone className="w-4 h-4 text-[#2aabb0] shrink-0" />
                <span className="font-mono">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <Mail className="w-4 h-4 text-[#2aabb0] shrink-0" />
                <span className="font-mono">contact@rcreation.in</span>
              </div>
            </div>
            
            <Link href="/contact" className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 border border-white/20 rounded text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-[#050714] transition-all group">
              <span>Send Inquiry</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-600">
          <p>© {new Date().getFullYear()} R Creation. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
