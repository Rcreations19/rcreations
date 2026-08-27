'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, Star, Check, Filter, X, ChevronDown, Flame } from 'lucide-react';
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
  categories,
  initialCategory
}: { 
  initialProducts: Record<string, any>[], 
  categories: Record<string, any>[],
  initialCategory?: string
}) {
  // Remove useSearchParams to prevent BAILOUT_TO_CLIENT_SIDE_RENDERING on the server
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Read search params only on the client side after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search');
      if (search) {
        setSearchQuery(search);
      }
    }
  }, []);

  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high' | 'rating' | 'moq'>('recommended');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [onlyWholesale, setOnlyWholesale] = useState(false);

  const [isFiltering, setIsFiltering] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { addPreset } = useCart();

  // Lock body scroll when mobile filters are open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.classList.add('scroll-locked');
    } else {
      document.body.classList.remove('scroll-locked');
    }
    return () => document.body.classList.remove('scroll-locked');
  }, [showMobileFilters]);

  const handleFilterChange = (setter: any, value: any) => {
    setter(value);
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
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-16">
        
        {/* Filters Sidebar */}
        <div className={`xl:col-span-3 ${showMobileFilters ? 'fixed inset-0 z-[80] bg-white/80 backdrop-blur-xl p-6 overflow-y-auto' : 'hidden xl:block'}`}>
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className={`bg-transparent space-y-10 ${showMobileFilters ? '' : 'sticky top-32 pt-2'}`}
          >
            {showMobileFilters && (
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-primary">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 text-[#595959] hover:bg-surface-muted rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}
            {/* Search */}
            <div>
              <label className="text-sm font-semibold tracking-tight text-neutral-900 block mb-3">Search Products</label>
              <div className="relative group">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-neutral-900 transition-colors" />
                <input type="text" placeholder="e.g. Acrylic LED..." value={searchQuery} onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-100/80 hover:bg-neutral-200/50 rounded-xl text-sm font-medium focus:bg-white focus:border-neutral-300 focus:ring-4 focus:ring-neutral-100 transition-all outline-none border border-transparent" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-sm font-semibold tracking-tight text-neutral-900 block mb-4">Categories</label>
              <div className="space-y-1">
                <button onClick={() => handleFilterChange(setSelectedCategory, 'all')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between outline-none ${
                    selectedCategory === 'all' ? 'bg-accent text-primary shadow-sm' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}>
                  <span>All Products</span>
                  {selectedCategory === 'all' && <motion.div layoutId="cat-indicator"><Check className="w-4 h-4 text-primary" /></motion.div>}
                </button>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => handleFilterChange(setSelectedCategory, cat.name.toLowerCase())}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between outline-none ${
                      selectedCategory === cat.name.toLowerCase() ? 'bg-accent text-primary shadow-sm' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}>
                    <span>{cat.name}</span>
                    {selectedCategory === cat.name.toLowerCase() && <motion.div layoutId="cat-indicator"><Check className="w-4 h-4 text-primary" /></motion.div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Slider */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-semibold tracking-tight text-neutral-900">Max Price</label>
                <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md">₹{maxPrice}</span>
              </div>
              <input type="range" min="100" max="10000" step="100" value={maxPrice} onChange={(e) => handleFilterChange(setMaxPrice, Number(e.target.value))}
                className="w-full accent-[#2aabb0] cursor-pointer h-1.5 bg-neutral-200 rounded-full appearance-none outline-none" />
            </div>

            {/* Wholesale Toggle */}
            <div className="pt-6">
              <label className="flex items-center gap-3 cursor-pointer group rounded-xl px-2 py-1.5">
                <div role="switch" aria-checked={onlyWholesale} tabIndex={0}
                  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleFilterChange(setOnlyWholesale, !onlyWholesale); } }}
                  onClick={() => handleFilterChange(setOnlyWholesale, !onlyWholesale)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${onlyWholesale ? 'bg-green-500' : 'bg-neutral-200'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${onlyWholesale ? 'translate-x-5' : 'translate-x-0'} shadow-sm`}></div>
                </div>
                <span className="text-sm font-semibold tracking-tight text-neutral-900">Wholesale Catalog Only</span>
                <input type="checkbox" className="sr-only" checked={onlyWholesale} onChange={(e) => handleFilterChange(setOnlyWholesale, e.target.checked)} />
              </label>
            </div>

            {/* Clear Filters */}
            {(selectedCategory !== 'all' || searchQuery || maxPrice < 5000 || onlyWholesale) && (
              <div className="pt-2">
                <button
                  onClick={() => { handleFilterChange(setSelectedCategory, 'all'); setSearchQuery(''); setMaxPrice(5000); setOnlyWholesale(false); }}
                  className="w-full py-3 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors bg-neutral-100/50 hover:bg-neutral-100 rounded-xl"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Product Grid Area */}
        <div className="xl:col-span-9 space-y-6">
          {/* Sticky Sort & Filter Bar (Mobile) */}
          <div className="xl:hidden sticky top-[60px] sm:top-[72px] z-30 bg-white border-b border-neutral-100 flex shadow-sm">
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-700 active:bg-neutral-50 transition-colors"
            >
              <Filter className="w-4 h-4 text-primary" /> Filter
            </button>
            <div className="w-[1px] bg-neutral-200 my-2"></div>
            <div className="flex-1 relative">
              <select 
                value={sortBy} 
                onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                className="w-full h-full appearance-none bg-transparent text-neutral-700 text-center px-4 py-3.5 text-xs font-bold uppercase tracking-wider outline-none focus:ring-0 cursor-pointer"
              >
                <option value="recommended">Sort</option>
                <option value="price-low">Low Price</option>
                <option value="price-high">High Price</option>
                <option value="rating">Top Rated</option>
                <option value="moq">Low MOQ</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            </div>
          </div>

          {/* Top Sort Bar (Desktop) */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="hidden xl:flex bg-transparent pb-4 border-b border-neutral-100 flex-wrap items-center justify-between gap-4 mb-4"
          >
            <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
              {[
                { id: 'recommended', label: 'Recommended' },
                { id: 'price-low', label: 'Price: Low' },
                { id: 'price-high', label: 'Price: High' },
                { id: 'rating', label: 'Top Rated' },
                { id: 'moq', label: 'Lowest MOQ' },
              ].map((s) => (
                <button key={s.id} onClick={() => handleFilterChange(setSortBy, s.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
                    sortBy === s.id ? 'bg-accent text-primary' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="text-sm font-medium text-neutral-400 tracking-tight shrink-0">
              {filteredProducts.length} Items
            </div>
          </motion.div>

          {/* Grid */}
          {isFiltering ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden flex flex-col h-[300px] sm:h-[400px]">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-20 text-center rounded-2xl border border-border">
              <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-[#595959]" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">No matching products</h3>
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
                    className="group bg-white rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-400 flex flex-col relative border border-neutral-100/60"
                  >
                    {/* Image Area */}
                    <Link href={`/products/${product.slug}`} className="relative aspect-square sm:aspect-[4/5] bg-neutral-100 overflow-hidden group/image block">
                      {/* Primary Image */}
                      <Image 
                        src={product.image_url} 
                        alt={product.title} 
                        fill 
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" 
                        className={`object-cover transform transition-all duration-700 ease-out group-hover/image:scale-110 ${
                          product.gallery_images && product.gallery_images.length > 1 ? 'group-hover/image:opacity-0' : ''
                        }`} 
                      />
                      
                      {/* Secondary Image (Hover State) */}
                      {product.gallery_images && product.gallery_images.length > 1 && (
                        <Image
                          src={product.gallery_images[1]}
                          alt={`${product.title} Alternate View`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover opacity-0 transition-all duration-700 ease-out absolute inset-0 group-hover/image:opacity-100 group-hover/image:scale-110"
                        />
                      )}
                      {/* Badges */}
                      <div className="absolute top-0 left-0 flex flex-col z-10 pointer-events-none">
                        {discount > 0 ? (
                          <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 shadow-sm rounded-br-lg">
                            {discount}% OFF
                          </span>
                        ) : product.is_bestseller ? (
                          <span className="bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 shadow-sm rounded-br-lg flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Best Seller
                          </span>
                        ) : null}
                      </div>
                    </Link>

                    {/* Content Area */}
                    <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between bg-white">
                      <Link href={`/products/${product.slug}`} className="block group/link mb-2">
                        <h3 className="text-sm sm:text-base font-medium tracking-tight text-neutral-900 mb-0.5 leading-snug group-hover/link:text-accent transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-1 opacity-90 mb-1">
                          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600 fill-green-600" />
                          <span className="text-xs sm:text-sm font-semibold text-neutral-600">{product.rating} <span className="text-neutral-400 font-normal">(120+)</span></span>
                        </div>
                      </Link>
                      
                      {/* Pricing */}
                      <div className="mt-auto mb-3 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                        {product.wholesale_price && product.moq ? (
                          <>
                            <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-900">₹{product.wholesale_price}</span>
                            <span className="text-[10px] sm:text-xs font-medium text-neutral-400 line-through">₹{product.price}</span>
                          </>
                        ) : (
                          <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-900">₹{product.price}</span>
                        )}
                      </div>
                      
                      {/* Explicit Add to Cart Button */}
                      <button 
                        onClick={(e) => { e.preventDefault(); addPreset({ id: product.id, title: product.title, price: product.price, wholesale_price: product.wholesale_price, image: product.image_url, subtitle: product.subtitle, moq: product.moq }); }}
                        className="w-full bg-white border border-neutral-200 text-primary py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold tracking-tight flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] active:bg-neutral-50 hover:border-primary hover:bg-neutral-50"
                      >
                        Add to cart
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
