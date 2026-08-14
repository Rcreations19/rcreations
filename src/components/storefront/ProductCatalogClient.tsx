'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, Star, Check, Heart, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/storefront/CartContext';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function ProductCatalogClient({ 
  initialProducts, 
  categories 
}: { 
  initialProducts: any[], 
  categories: any[] 
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high' | 'rating' | 'moq'>('recommended');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [onlyWholesale, setOnlyWholesale] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { addPreset } = useCart();

  const handleFilterChange = (setter: any, value: any) => {
    setIsFiltering(true);
    setter(value);
    setTimeout(() => setIsFiltering(false), 400);
  };

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((prod) => {
      const catName = prod.category?.name?.toLowerCase() || '';
      
      if (selectedCategory !== 'all' && catName !== selectedCategory.toLowerCase()) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        if (!prod.title?.toLowerCase().includes(q) && !prod.subtitle?.toLowerCase().includes(q)) return false;
      }
      if (prod.price > maxPrice) return false;
      if (onlyWholesale && !prod.is_wholesale_featured) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'moq') return a.moq - b.moq;
      return 0;
    });
  }, [initialProducts, selectedCategory, searchQuery, sortBy, maxPrice, onlyWholesale]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">


      {/* Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Filters Sidebar */}
        <div className={`xl:col-span-3 ${showMobileFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden xl:block'}`}>
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className={`bg-white rounded-none space-y-8 ${showMobileFilters ? '' : 'sticky top-28 border border-[#eaeaea] p-6'}`}
          >
            {showMobileFilters && (
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#0a0e27]">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 text-[#595959] hover:bg-[#f8f9fa] rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}
            {/* Search */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#595959] block mb-2">Search Products</label>
              <div className="relative group">
                <Search className="w-4 h-4 text-[#0a0e27] absolute left-0 top-1/2 -translate-y-1/2 group-focus-within:text-[#2aabb0] transition-colors" />
                <input type="text" placeholder="e.g. Acrylic LED..." value={searchQuery} onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-transparent border-b border-[#0a0e27] rounded-none text-xs focus:border-[#2aabb0] focus:outline-none transition-all" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#595959] block mb-3">Categories</label>
              <div className="space-y-1.5">
                <button onClick={() => handleFilterChange(setSelectedCategory, 'all')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                    selectedCategory === 'all' ? 'bg-[#0a0e27] text-white shadow-md' : 'text-[#555555] hover:bg-[#f8f9fa] hover:text-[#0a0e27]'
                  }`}>
                  <span>All Products</span>
                  {selectedCategory === 'all' && <motion.div layoutId="cat-indicator"><Check className="w-4 h-4 text-[#2aabb0]" /></motion.div>}
                </button>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => handleFilterChange(setSelectedCategory, cat.name.toLowerCase())}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                      selectedCategory === cat.name.toLowerCase() ? 'bg-[#0a0e27] text-white shadow-md' : 'text-[#555555] hover:bg-[#f8f9fa] hover:text-[#0a0e27]'
                    }`}>
                    <span>{cat.name}</span>
                    {selectedCategory === cat.name.toLowerCase() && <motion.div layoutId="cat-indicator"><Check className="w-4 h-4 text-[#2aabb0]" /></motion.div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#595959]">Max Price</label>
                <span className="text-xs font-mono font-bold text-[#0a0e27] bg-[#f8f9fa] px-2 py-1 rounded">₹{maxPrice}</span>
              </div>
              <input type="range" min="100" max="10000" step="100" value={maxPrice} onChange={(e) => handleFilterChange(setMaxPrice, Number(e.target.value))}
                className="w-full accent-[#0a0e27] cursor-pointer" />
            </div>

            {/* Wholesale Toggle */}
            <div className="pt-6 border-t border-[#eaeaea]">
              <label className="flex items-center gap-2 cursor-pointer group focus-within:ring-2 focus-within:ring-[#2aabb0] focus-within:ring-offset-2 rounded-full px-2 py-1">
                <div role="switch" aria-checked={onlyWholesale} tabIndex={0}
                  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleFilterChange(setOnlyWholesale, !onlyWholesale); } }}
                  onClick={() => handleFilterChange(setOnlyWholesale, !onlyWholesale)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${onlyWholesale ? 'bg-[#2aabb0]' : 'bg-[#eaeaea]'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${onlyWholesale ? 'translate-x-5' : 'translate-x-0'} shadow-sm`}></div>
                </div>
                <span className="text-xs font-bold text-[#0a0e27]">Wholesale B2B Catalog Only</span>
                <input type="checkbox" className="sr-only" checked={onlyWholesale} onChange={(e) => handleFilterChange(setOnlyWholesale, e.target.checked)} />
              </label>
            </div>

            {/* Clear Filters */}
            {(selectedCategory !== 'all' || searchQuery || maxPrice < 5000 || onlyWholesale) && (
              <button
                onClick={() => { handleFilterChange(setSelectedCategory, 'all'); setSearchQuery(''); setMaxPrice(5000); setOnlyWholesale(false); }}
                className="w-full py-2.5 text-xs font-bold text-[#2aabb0] hover:text-[#10164A] transition-colors border border-[#2aabb0]/30 rounded-lg hover:bg-[#2aabb0]/5"
              >
                Clear All Filters
              </button>
            )}
          </motion.div>
        </div>

        {/* Product Grid Area */}
        <div className="xl:col-span-9 space-y-6">
          
          {/* Top Sort Bar */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white p-2 rounded-xl border border-[#eaeaea] shadow-sm flex flex-wrap items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="xl:hidden flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#0a0e27] text-white shrink-0"
              >
                <Filter className="w-4 h-4" /> Filters
              </button>
              {[
                { id: 'recommended', label: 'Recommended' },
                { id: 'price-low', label: 'Price: Low' },
                { id: 'price-high', label: 'Price: High' },
                { id: 'rating', label: 'Top Rated' },
                { id: 'moq', label: 'Lowest MOQ' },
              ].map((s) => (
                <button key={s.id} onClick={() => handleFilterChange(setSortBy, s.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    sortBy === s.id ? 'bg-[#f8f9fa] text-[#0a0e27] shadow-sm' : 'text-[#595959] hover:text-[#0a0e27] hover:bg-[#fcfcfc]'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="px-4 text-[10px] font-mono font-bold text-[#595959] uppercase tracking-wider hidden sm:block shrink-0">
              Showing {filteredProducts.length} Items
            </div>
          </motion.div>

          {/* Grid */}
          {isFiltering ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#eaeaea] overflow-hidden flex flex-col h-[300px] sm:h-[400px]">
                  <div className="w-full aspect-[4/5] bg-neutral-100"></div>
                  <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="w-20 h-3 bg-neutral-100 rounded mb-3"></div>
                      <div className="w-full h-5 bg-neutral-100 rounded mb-2"></div>
                      <div className="w-2/3 h-4 bg-neutral-100 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-20 text-center rounded-2xl border border-[#eaeaea]">
              <div className="w-16 h-16 bg-[#f8f9fa] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-[#595959]" />
              </div>
              <h3 className="text-lg font-bold text-[#0a0e27] mb-2">No matching products</h3>
              <p className="text-xs text-[#595959]">Try adjusting your search terms or filters.</p>
            </motion.div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              animate="visible"
              className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
            >
              <AnimatePresence>
                {filteredProducts.map((product) => {
                  const discount = Math.round(((product.price - product.wholesale_price) / product.price) * 100);
                  
                  return (
                  <motion.div 
                    key={product.id}
                    layout
                    variants={fadeUp}
                    className="group bg-white rounded-xl border border-[#eaeaea] overflow-hidden hover:border-[#2aabb0]/30 hover:shadow-lg hover:shadow-[#2aabb0]/5 transition-all duration-300 flex flex-col relative"
                  >
                    {/* Image Area */}
                    <Link href={`/products/${product.slug}`} className="relative aspect-[4/5] bg-[#f8f9fa] overflow-hidden group/image block">
                      <Image src={product.image_url} alt={product.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                        {discount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-black font-mono uppercase px-2.5 py-1 rounded shadow-sm">
                            {discount}% OFF
                          </span>
                        )}
                        {product.is_bestseller && (
                          <span className="bg-[#0a0e27] text-white text-[10px] font-bold font-mono uppercase px-2.5 py-1 rounded shadow-sm">Bestseller</span>
                        )}
                        <span className="bg-[#2aabb0] text-[#0a0e27] text-[10px] font-black font-mono uppercase px-2.5 py-1 rounded shadow-sm">
                          MOQ {product.moq}
                        </span>
                      </div>
                    </Link>

                    {/* Content Area */}
                    <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between relative z-10 bg-white">
                      <Link href={`/products/${product.slug}`} className="block group/link mb-2">
                        <div className="flex items-center gap-1 mb-1.5">
                          <Star className="w-3 h-3 text-[#2aabb0] fill-[#2aabb0]" />
                          <span className="text-xs font-bold text-[#0a0e27]">{product.rating}</span>
                          <span className="text-[10px] text-[#595959] font-mono">({product.review_count})</span>
                        </div>
                        <h3 className="text-sm font-bold text-[#0a0e27] mb-1 leading-tight group-hover/link:text-[#2aabb0] transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-[#595959] line-clamp-1">{product.subtitle}</p>
                      </Link>
                      
                      {/* Pricing */}
                      <div className="mt-auto pt-3 border-t border-[#eaeaea]">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Wholesale</span>
                            <span className="text-sm text-neutral-400 line-through font-mono">₹{product.price}</span>
                          </div>
                          <span className="text-xl font-black text-[#0a0e27] font-mono">₹{product.wholesale_price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Full Width Quick Add (Desktop Hover, Mobile Always Visible) */}
                    <div className="p-3 pt-0 sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:translate-y-full sm:group-hover:translate-y-0 sm:bg-white sm:p-5 sm:shadow-[0_-10px_15px_-3px_rgba(255,255,255,1)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-20">
                      <button 
                        onClick={(e) => { e.preventDefault(); addPreset({ id: product.id, title: product.title, price: product.price, image: product.image_url, subtitle: product.subtitle, moq: product.moq }); }}
                        className="w-full bg-[#0a0e27] hover:bg-[#2aabb0] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" /> Quick Add
                      </button>
                    </div>
                  </motion.div>
                )})}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
