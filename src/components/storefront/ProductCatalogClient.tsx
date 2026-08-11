'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, Star, Check, Heart } from 'lucide-react';
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">


      {/* Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Filters Sidebar */}
        <div className="xl:col-span-3">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className="sticky top-28 bg-white p-6 rounded-none border border-[#eaeaea] space-y-8"
          >
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
                <div className={`w-10 h-5 rounded-full transition-colors relative ${onlyWholesale ? 'bg-[#2aabb0]' : 'bg-[#eaeaea]'}`}>
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
            className="bg-white p-2 rounded-xl border border-[#eaeaea] shadow-sm flex flex-wrap items-center gap-2"
          >
            {[
              { id: 'recommended', label: 'Recommended' },
              { id: 'price-low', label: 'Price: Low' },
              { id: 'price-high', label: 'Price: High' },
              { id: 'rating', label: 'Top Rated' },
              { id: 'moq', label: 'Lowest MOQ' },
            ].map((s) => (
              <button key={s.id} onClick={() => handleFilterChange(setSortBy, s.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  sortBy === s.id ? 'bg-[#f8f9fa] text-[#0a0e27] shadow-sm' : 'text-[#595959] hover:text-[#0a0e27] hover:bg-[#fcfcfc]'
                }`}>
                {s.label}
              </button>
            ))}
            <div className="ml-auto px-4 text-[10px] font-mono font-bold text-[#595959] uppercase tracking-wider hidden sm:block">
              Showing {filteredProducts.length} Items
            </div>
          </motion.div>

          {/* Grid */}
          {isFiltering ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#eaeaea] overflow-hidden flex flex-col h-[400px]">
                  <div className="w-full aspect-[4/3] bg-neutral-100"></div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
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
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div 
                    key={product.id}
                    layout
                    variants={fadeUp}
                    className="group bg-white rounded-none border border-[#eaeaea] overflow-hidden hover:border-[#0a0e27] transition-all duration-500 flex flex-col relative"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-[4/5] bg-[#f8f9fa] overflow-hidden group/image block">
                      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0 block">
                        <Image src={product.image_url} alt={product.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" />
                      </Link>
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                        {product.is_bestseller && (
                          <span className="bg-[#0a0e27] text-white text-[9px] font-bold font-mono uppercase px-2.5 py-1 rounded shadow-sm">Bestseller</span>
                        )}
                        <span className="bg-[#2aabb0] text-[#0a0e27] text-[9px] font-black font-mono uppercase px-2.5 py-1 rounded shadow-sm">
                          MOQ {product.moq} Pcs
                        </span>
                      </div>

                      {/* Quick Add Button (ASOS Position) */}
                      <button 
                        onClick={(e) => { e.preventDefault(); addPreset({ id: product.id, title: product.title, price: product.price, image: product.image_url, subtitle: product.subtitle, moq: product.moq }); }}
                        className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-sm hover:bg-[#2aabb0] text-[#0a0e27] w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3.5 h-3.5 fill-[#F5B838] text-[#F5B838]" />
                          <span className="text-[10px] font-bold text-[#0a0e27]">{product.rating}</span>
                          <span className="text-[10px] text-[#595959] font-mono">({product.review_count})</span>
                        </div>
                        <Link href={`/products/${product.slug}`} className="block group/link">
                          <h3 className="text-xl font-serif-heading font-extrabold text-[#0a0e27] line-clamp-1 group-hover/link:text-[#2aabb0] transition-colors">{product.title}</h3>
                        </Link>
                        <p className="text-xs text-[#555555] line-clamp-2 mt-1">{product.subtitle}</p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#eaeaea]">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#595959] block mb-0.5">Retail</span>
                            <span className="text-sm font-extrabold text-[#0a0e27] font-mono">₹{product.price}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">Wholesale</span>
                            <span className="text-lg font-black text-emerald-600 font-mono">₹{product.wholesale_price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
