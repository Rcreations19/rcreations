'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Star, ShoppingBag, ArrowRight, ShieldCheck, Truck, Package, Check, Clock, Flame, Camera, Crown, X } from 'lucide-react';
import { useCart } from '@/components/storefront/CartContext';
import { toast } from 'sonner';
import Image from 'next/image';
import PhotoCropper from '@/components/storefront/PhotoCropper';
import { motion, AnimatePresence } from 'framer-motion';

const FaqItem = ({ faq, isOpen, onClick }: { faq: { question: string; answer: string }, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border-b border-border">
        <button 
          onClick={onClick}
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 rounded group"
        >
        <h3 className="text-xs font-bold text-primary uppercase tracking-wider group-hover:text-accent transition-colors pr-8">{faq.question}</h3>
        <span className="text-primary group-hover:text-accent transition-colors font-serif-heading text-xl">
          {isOpen ? '—' : '+'}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm text-[#555555] leading-relaxed whitespace-pre-wrap">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProductDetailClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
  const { addPreset } = useCart();
  const [added, setAdded] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setCropImageSrc(reader.result?.toString() || null));
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (base64Image: string) => {
    setCropImageSrc(null);
    setIsSharing(true);
    try {
      if (navigator.share) {
        const response = await fetch(base64Image);
        const blob = await response.blob();
        const file = new File([blob], 'custom-frame-photo.jpg', { type: 'image/jpeg' });
        
        const message = `Hi, I'd like a custom frame quote.\nProduct: ${product.title}\nDimensions: ${product.dimensions}\nPlease see the attached photo.`;
        
        // Ensure navigator can share files
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Custom Frame Order',
            text: message,
            files: [file]
          });
          toast.success('Shared to WhatsApp successfully!');
        } else {
          throw new Error('File sharing not supported natively');
        }
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (e) {
      console.warn("Fallback to manual download: ", e);
      // Fallback for desktop/unsupported browsers
      const link = document.createElement('a');
      link.href = base64Image;
      link.download = 'custom-frame-photo.jpg';
      link.click();
      
      const text = encodeURIComponent(`Hi, I'd like a custom frame quote.\nProduct: ${product.title}\nDimensions: ${product.dimensions}\n(I have saved the photo to my device and will attach it here)`);
      window.open(`https://wa.me/918754940610?text=${text}`, '_blank');
      toast.success('Photo saved! Please attach it in WhatsApp.');
    } finally {
      setIsSharing(false);
    }
  };

  let actualSpecs: {label: string, value: string}[] = [];
  let actualFaqs: {question: string, answer: string}[] = [];
  
  if (product.specifications) {
    try {
      const parsed = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications;
      if (Array.isArray(parsed)) {
        actualSpecs = parsed;
      } else if (parsed && typeof parsed === 'object') {
        actualSpecs = parsed.specs || [];
        actualFaqs = parsed.faqs || [];
      }
    } catch {
      // Ignore parsing errors
    }
  }



  const handleAddToCart = () => {
    addPreset({
      id: product.id,
      title: product.title,
      price: product.price,
      wholesale_price: product.wholesale_price,
      image: product.image_url,
      subtitle: product.subtitle,
      moq: product.moq,
    });
    setAdded(true);
    toast.success(`${product.title} added to cart`);
    setTimeout(() => setAdded(false), 2000);
  };

  const allImages = product.gallery_images?.length > 0 
    ? product.gallery_images 
    : (product.image_url ? [product.image_url] : []);
  const [currentImage, setCurrentImage] = useState(allImages[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="pt-4 md:pt-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-4 md:mb-6 flex items-center gap-2 text-xs text-neutral-500">
        <Link href="/" className="hover:text-[#10164A] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#10164A] transition-colors">Catalog</Link>
        <span>/</span>
        <span className="text-[#10164A] font-medium">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative bg-[#FAFAFA] rounded-none overflow-hidden border border-border">
            {/* Mobile Swipeable Gallery with Dots */}
            <div className="relative group/gallery">
              <div 
                className="flex sm:hidden overflow-x-auto snap-x snap-mandatory hide-scrollbar aspect-[4/5]"
                onScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  const index = Math.round(target.scrollLeft / target.clientWidth);
                  const dots = target.parentElement?.querySelectorAll('.gallery-dot');
                  dots?.forEach((dot, i) => {
                    if (i === index) dot.classList.add('bg-primary');
                    else { dot.classList.remove('bg-primary'); dot.classList.add('bg-white/50'); }
                  });
                }}
              >
                {allImages.map((img: string, idx: number) => (
                  <div key={idx} className="w-full flex-shrink-0 snap-center relative aspect-[4/5]">
                    <Image src={img} alt={`${product.title} ${idx + 1}`} fill className="object-cover" sizes="100vw" priority={idx === 0} />
                  </div>
                ))}
              </div>
              {/* Pagination Dots overlay */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 sm:hidden pointer-events-none">
                  {allImages.map((_: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={`gallery-dot w-2 h-2 rounded-full transition-colors ${idx === 0 ? 'bg-primary' : 'bg-white/50 backdrop-blur-sm border border-black/10'}`} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Image View */}
            <div className="hidden sm:block relative aspect-[4/5] bg-[#FDFBF7] rounded-2xl overflow-hidden shadow-sm border border-neutral-100">
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={product.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
              )}
            </div>

            {/* Removed absolute bestseller badge from image */}
          </div>
          
          {/* Thumbnails (Hidden on Mobile) */}
          {allImages.length > 1 && (
            <div className="hidden sm:flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {allImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(img)}
                  className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${currentImage === img ? 'border-[#10164A]' : 'border-transparent hover:border-neutral-300'}`}
                >
                  <Image src={img} alt={`${product.title} view ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="mb-6">
            {product.is_bestseller && (
              <div className="flex items-center gap-1.5 mb-3 inline-flex bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">#1 Most Popular</span>
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-heading font-black text-primary leading-[1.1] mb-4">
              {product.title}
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              {product.review_count > 0 ? (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'text-accent fill-accent' : 'text-neutral-300'}`} />
                  ))}
                  <span className="ml-1 text-sm font-bold text-primary">{product.rating || '5.0'}</span>
                  <span className="text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-4 ml-1 hover:text-primary cursor-pointer transition-colors">
                    {product.review_count} reviews
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-neutral-300" />
                  <span className="text-sm text-neutral-500 ml-1">No reviews yet</span>
                </div>
              )}
              <div className="w-1 h-1 bg-neutral-300 rounded-full hidden sm:block"></div>
              {product.inventory_count === null || product.inventory_count > 0 ? (
                <span className="text-sm text-emerald-600 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> In Stock {product.inventory_count != null ? `(${product.inventory_count})` : ''}
                </span>
              ) : (
                <span className="text-sm text-red-600 font-bold flex items-center gap-1.5">
                  <X className="w-4 h-4" /> Out of Stock
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-neutral-600 mb-6">{product.subtitle}</p>

          {/* Pricing */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-[#10164A] font-mono tabular">₹{product.price}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Retail Price</span>
            </div>
            
            {product.wholesale_price && product.moq && (
              <div className="bg-white border-2 border-dashed border-emerald-300/70 rounded-xl p-4 sm:p-5 relative overflow-hidden group/wholesale hover:border-emerald-400 transition-colors">
                <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-[11px] sm:text-xs font-black uppercase px-3 py-1 sm:px-4 sm:py-1.5 rounded-bl-xl font-mono shadow-sm">
                  Save {Math.round(((product.price - product.wholesale_price) / product.price) * 100)}%
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 sm:mt-0">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-base sm:text-lg font-black text-primary block mb-0.5">Wholesale Offer</span>
                      <span className="text-xs sm:text-sm text-neutral-500">Add <span className="font-bold text-emerald-600">{product.moq} or more</span> for bulk price</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono tabular">₹{product.wholesale_price}</span>
                    <span className="text-[10px] sm:text-xs text-emerald-600/70 uppercase tracking-wider font-bold mt-0.5">Per Unit</span>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-[10px] text-neutral-500 font-mono mt-1">GST (18%) and Shipping calculated at checkout</p>
          </div>

          {/* Urgency & Scarcity (CRO) */}
          {(product.stock_urgency_remaining || product.urgency_timer_title) && (
            <div className="flex flex-col gap-3 mb-6">
              {product.stock_urgency_remaining > 0 && (
                <div className="flex items-center gap-3 bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-100">
                  <Flame className="w-5 h-5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold">High Demand!</p>
                    <p className="text-[10px]">Only {product.stock_urgency_remaining} units remaining at this factory price.</p>
                  </div>
                </div>
              )}
              {product.urgency_timer_title && (
                <div className="flex items-center gap-3 bg-amber-50 text-amber-800 px-4 py-3 rounded-lg border border-amber-100">
                  <Clock className="w-5 h-5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold">{product.urgency_timer_title}</p>
                    {product.urgency_timer_subtitle && (
                      <p className="text-[10px]">{product.urgency_timer_subtitle}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Key Specs */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-700">
              <Package className="w-4 h-4 text-accent shrink-0" />
              <span>{product.material}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <span className="w-4 h-4 flex items-center justify-center text-accent shrink-0 font-mono text-[10px]">cm</span>
              <span>{product.dimensions}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <Truck className="w-4 h-4 text-accent shrink-0" />
              <span>Lead time: {product.lead_time}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
              <span>Factory QC guaranteed</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-neutral-600 leading-relaxed mb-8">{product.description}</p>

          {/* Add to Cart (Hidden on mobile due to sticky bar) */}
          <div className="hidden sm:flex flex-col sm:flex-row gap-3 mb-4">
            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`flex-1 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                added 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-accent text-primary hover:bg-[#38C8CC]'
              }`}
            >
              {added ? (
                <><Check className="w-4 h-4" /> Added to Cart</>
              ) : (
                <><ShoppingBag className="w-4 h-4" /> Add to Cart</>
              )}
            </button>
            <Link
              href="/contact"
              className="py-3.5 px-6 border border-primary text-primary rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Bulk Inquiry <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Sticky Mobile CTA Bar */}
          <div className="sm:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.08)] p-3 border-t border-neutral-200 flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`flex-1 py-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-[0_8px_30px_rgba(0,0,0,0.15)] flex items-center justify-center gap-1.5 ${
                added 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-primary text-white active:scale-[0.98]'
              }`}
            >
              {added ? <><Check className="w-4 h-4 shrink-0" /> Added</> : <><ShoppingBag className="w-4 h-4 shrink-0" /> Add to Cart - ₹{product.price}</>}
            </button>
            <Link
              href="/contact"
              className="py-4 px-4 border border-primary text-primary rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              aria-label="Bulk Inquiry"
            >
              <ArrowRight className="w-4 h-4 shrink-0" /> Bulk
            </Link>
          </div>

          <label
            className={`w-full py-3.5 mb-8 border-2 border-emerald-500 text-emerald-600 rounded-none text-xs font-bold uppercase tracking-wider hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden ${isSharing ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isSharing} />
            {isSharing ? 'Processing...' : <><Camera className="w-4 h-4" /> Order with Custom Photo on WhatsApp</>}
          </label>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-neutral-200">
            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> GST Invoice
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Factory Direct
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Local Delivery (40km Radius)
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      {actualSpecs && actualSpecs.length > 0 && (
        <div className="mt-20" id="reviews">
          <h2 className="text-3xl font-serif-heading font-extrabold text-primary mb-8">Technical Specifications</h2>
          <div className="bg-white rounded-none border-y border-border">
            <div className="divide-y divide-[#eaeaea]">
              {actualSpecs.map((spec: { label: string; value: string }, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-4">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#595959] sm:w-48 shrink-0">{spec.label}</span>
                  <span className="text-sm text-primary font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {actualFaqs && actualFaqs.length > 0 && (
        <div className="mt-20 max-w-4xl">
          <h2 className="text-3xl font-serif-heading font-extrabold text-primary mb-8">Frequently Asked Questions</h2>
          <div className="border-t border-border">
            {actualFaqs.map((faq, idx) => (
              <FaqItem 
                key={idx} 
                faq={faq} 
                isOpen={openFaq === idx} 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-24">
          <h2 className="text-3xl font-serif-heading font-extrabold text-primary mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(related => (
              <Link
                key={related.id}
                href={`/products/${related.slug}`}
                className="group bg-white rounded-none border-b border-border overflow-hidden hover:border-primary transition-all pb-4"
              >
                <div className="aspect-[4/5] bg-[#FAFAFA] overflow-hidden relative group/image">
                  <Image src={related.image_url} alt={related.title} width={400} height={500} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover/image:scale-105 ${related.gallery_images && related.gallery_images.length > 1 ? 'group-hover/image:opacity-0' : ''}`} />
                  {related.gallery_images && related.gallery_images.length > 1 && (
                    <Image src={related.gallery_images[1]} alt={related.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="w-full h-full object-cover absolute inset-0 opacity-0 transition-all duration-700 ease-out group-hover/image:opacity-100 group-hover/image:scale-105" />
                  )}
                </div>
                <div className="pt-4 flex flex-col flex-grow bg-white group-hover:bg-neutral-50/50 transition-colors p-3">
                  {related.is_bestseller && (
                    <div className="flex items-center gap-1 mb-1.5">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">Most Popular</span>
                    </div>
                  )}
                  <h3 className="text-sm sm:text-base font-serif-heading font-extrabold text-primary line-clamp-2 mb-1.5 leading-snug group-hover:text-accent transition-colors">{related.title}</h3>
                  <div className="mt-auto pt-3 border-t border-border">
                    {related.wholesale_price && related.moq ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-medium text-neutral-500 line-through">Retail: ₹{related.price}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-emerald-600 font-mono tabular">₹{related.wholesale_price}</span>
                          <span className="text-[10px] font-medium text-emerald-700/70">Bulk (from {related.moq} qty)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-primary font-mono tabular">₹{related.price}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {cropImageSrc && (
        <PhotoCropper 
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
    </div>
  );
}
