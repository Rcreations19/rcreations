'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin, ArrowRight, ChevronDown } from 'lucide-react';
import { RCreationLogo } from '../shared/Logo';

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-12 pb-8 md:pt-20 md:pb-10 border-t border-white/10 relative overflow-hidden">
      {/* Decorative gradient orb - hidden on mobile for performance */}
      <div className="hidden md:block absolute top-0 right-0 w-96 h-96 bg-accent rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-6">
            <RCreationLogo variant="full-horizontal" theme="dark" iconSize={40} />
            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
              Vellore & Gudiyattam&rsquo;s premier manufacturer of synthetic photo frames, optic crystal trophies, and customized wooden mementos. Factory-direct pricing since 2015.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://www.instagram.com/thercreationframes" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-300 hover:bg-accent hover:text-[#000420] transition-all" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=100091502950429" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-300 hover:bg-accent hover:text-[#000420] transition-all" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/in/r-creations-71247342b/" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-300 hover:bg-accent hover:text-[#000420] transition-all" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 border-t border-white/10 md:border-t-0 pt-4 md:pt-0">
            {/* Mobile Accordion */}
            <details className="group md:hidden">
              <summary className="flex items-center justify-between cursor-pointer list-none text-[10px] font-bold text-accent uppercase tracking-widest font-mono py-2">
                Catalog
                <ChevronDown className="w-4 h-4 transition-transform group-open:-rotate-180" />
              </summary>
              <ul className="space-y-4 pt-4 pb-2">
                <li><Link href="/products" className="text-sm text-neutral-400 hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/collections/frames" className="text-sm text-neutral-400 hover:text-white transition-colors">Photo Frames</Link></li>
                <li><Link href="/collections/trophies" className="text-sm text-neutral-400 hover:text-white transition-colors">Crystal Trophies</Link></li>
                <li><Link href="/collections/gifts" className="text-sm text-neutral-400 hover:text-white transition-colors">Custom Gifts</Link></li>
              </ul>
            </details>
            
            {/* Desktop Block */}
            <div className="hidden md:block">
              <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-6 font-mono">Catalog</h3>
              <ul className="space-y-4">
                <li><Link href="/products" className="text-sm text-neutral-400 hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/collections/frames" className="text-sm text-neutral-400 hover:text-white transition-colors">Photo Frames</Link></li>
                <li><Link href="/collections/trophies" className="text-sm text-neutral-400 hover:text-white transition-colors">Crystal Trophies</Link></li>
                <li><Link href="/collections/gifts" className="text-sm text-neutral-400 hover:text-white transition-colors">Custom Gifts</Link></li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 border-t border-white/10 md:border-t-0 pt-4 md:pt-0">
            {/* Mobile Accordion */}
            <details className="group md:hidden">
              <summary className="flex items-center justify-between cursor-pointer list-none text-[10px] font-bold text-accent uppercase tracking-widest font-mono py-2">
                Company
                <ChevronDown className="w-4 h-4 transition-transform group-open:-rotate-180" />
              </summary>
              <ul className="space-y-4 pt-4 pb-2">
                <li><Link href="/wholesale" className="text-sm text-neutral-400 hover:text-white transition-colors">B2B Wholesale</Link></li>
                <li><Link href="/locations/vellore" className="text-sm text-neutral-400 hover:text-white transition-colors">Areas Served</Link></li>
                <li><Link href="/track" className="text-sm text-neutral-400 hover:text-white transition-colors">Track Order</Link></li>
                <li><Link href="/configurator" className="text-sm text-neutral-400 hover:text-white transition-colors">Frame Builder</Link></li>
                <li><Link href="/specs" className="text-sm text-neutral-400 hover:text-white transition-colors">Tech Specs</Link></li>
                <li><Link href="/blogs" className="text-sm text-neutral-400 hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </details>
            
            {/* Desktop Block */}
            <div className="hidden md:block">
              <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-6 font-mono">Company</h3>
              <ul className="space-y-4">
                <li><Link href="/wholesale" className="text-sm text-neutral-400 hover:text-white transition-colors">B2B Wholesale</Link></li>
                <li><Link href="/locations/vellore" className="text-sm text-neutral-400 hover:text-white transition-colors">Areas Served</Link></li>
                <li><Link href="/track" className="text-sm text-neutral-400 hover:text-white transition-colors">Track Order</Link></li>
                <li><Link href="/configurator" className="text-sm text-neutral-400 hover:text-white transition-colors">Frame Builder</Link></li>
                <li><Link href="/specs" className="text-sm text-neutral-400 hover:text-white transition-colors">Tech Specs</Link></li>
                <li><Link href="/blogs" className="text-sm text-neutral-400 hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Col */}
          <div className="lg:col-span-4">
            <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-6 font-mono">Factory Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-neutral-400">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-1" />
                <span className="leading-relaxed">R Creation, Gudiyattam,<br />Vellore District, Tamil Nadu - 632602</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <a href="tel:+918754940610" className="font-mono hover:text-white transition-colors">+91-8754940610</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span className="font-mono">rcreationsstudio@gmail.com</span>
              </div>
            </div>
            
            <Link href="/contact" className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 border border-white/20 rounded text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-[#000420] transition-all group">
              <span>Send Inquiry</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-600">
          <p>© {new Date().getFullYear()} R Creation. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Terms &amp; Conditions</Link>
            <Link href="/cookies" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
