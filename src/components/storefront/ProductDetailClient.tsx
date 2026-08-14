'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Star, ShoppingBag, ArrowRight, ShieldCheck, Truck, Package, Check, Clock, Flame, Camera } from 'lucide-react';
import { useCart } from '@/components/storefront/CartContext';
import { useToast } from '@/components/shared/ToastContext';
import Image from 'next/image';
import PhotoCropper from '@/components/storefront/PhotoCropper';
import { motion, AnimatePresence } from 'framer-motion';

const FaqItem = ({ faq, isOpen, onClick }: { faq: { question: string; answer: string }, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border-b border-[#eaeaea]">
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left focus:outline-none group"
      >
        <h3 className="text-xs font-bold text-[#0a0e27] uppercase tracking-wider group-hover:text-[#2aabb0] transition-colors pr-8">{faq.question}</h3>
        <span className="text-[#0a0e27] group-hover:text-[#2aabb0] transition-colors font-serif-heading text-xl">
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
  const { showToast } = useToast();
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
          showToast('Shared to WhatsApp successfully!', 'success');
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
      showToast('Photo saved! Please attach it in WhatsApp.', 'success');
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
      image: product.image_url,
      subtitle: product.subtitle,
      moq: product.moq,
    });
    setAdded(true);
    showToast(`${product.title} added to cart`, 'success');
    setTimeout(() => setAdded(false), 2000);
  };

  const allImages = product.gallery_images?.length > 0 
    ? product.gallery_images 
    : (product.image_url ? [product.image_url] : []);
  const [currentImage, setCurrentImage] = useState(allImages[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-neutral-500">
        <Link href="/" className="hover:text-[#10164A] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#10164A] transition-colors">Catalog</Link>
        <span>/</span>
        <span className="text-[#10164A] font-medium">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative bg-[#FAFAFA] rounded-none overflow-hidden border border-[#eaeaea]">
            {/* Mobile Swipeable Gallery */}
            <div className="flex sm:hidden overflow-x-auto snap-x snap-mandatory hide-scrollbar aspect-[4/5]">
              {allImages.map((img: string, idx: number) => (
                <div key={idx} className="w-full flex-shrink-0 snap-center relative aspect-[4/5]">
                  <Image src={img} alt={`${product.title} ${idx + 1}`} fill className="object-cover" sizes="100vw" priority={idx === 0} fetchPriority={idx === 0 ? "high" : "auto"} />
                </div>
              ))}
            </div>

            {/* Desktop Single Image */}
            <div className="hidden sm:block relative aspect-[4/5]">
              {currentImage ? (
                <Image src={currentImage} alt={product.title} fill className="object-cover transition-opacity duration-300" priority sizes="50vw" fetchPriority="high" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
              )}
            </div>

            {product.is_bestseller && (
              <span className="absolute top-4 left-4 bg-[#10164A] text-white text-[10px] font-bold font-mono uppercase px-3 py-1.5 rounded shadow-sm">
                Bestseller
              </span>
            )}
          </div>
          
          {/* Thumbnails (Hidden on Mobile) */}
          {allImages.length > 1 && (
            <div className="hidden sm:flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {allImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(img)}
                  className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-colors ${currentImage === img ? 'border-[#10164A]' : 'border-transparent hover:border-neutral-300'}`}
                >
                  <Image src={img} alt={`${product.title} view ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating || 5) ? 'fill-[#F5B838] text-[#F5B838]' : 'text-neutral-200'}`} />
              ))}
            </div>
            <span className="text-xs font-bold text-[#10164A]">{product.rating || '5.0'}</span>
            <span className="text-xs text-neutral-500 font-mono">({product.review_count || 0} reviews)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10164A] tracking-tight mb-2">{product.title}</h1>
          <p className="text-sm text-neutral-600 mb-6">{product.subtitle}</p>

          {/* Pricing */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 mb-6">
            <div className="flex items-baseline gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">Retail Price</span>
                <span className="text-2xl font-black text-[#10164A] font-mono">₹{product.price}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">Wholesale Price</span>
                <span className="text-2xl font-black text-emerald-600 font-mono">₹{product.wholesale_price}</span>
              </div>
            </div>
            <p className="text-[10px] text-neutral-500 font-mono mt-3">MOQ: {product.moq} units • GST (18%) applicable on all orders</p>
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
              <Package className="w-4 h-4 text-[#2aabb0] shrink-0" />
              <span>{product.material}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <span className="w-4 h-4 flex items-center justify-center text-[#2aabb0] shrink-0 font-mono text-[10px]">cm</span>
              <span>{product.dimensions}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <Truck className="w-4 h-4 text-[#2aabb0] shrink-0" />
              <span>Lead time: {product.lead_time}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <ShieldCheck className="w-4 h-4 text-[#2aabb0] shrink-0" />
              <span>Factory QC guaranteed</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-neutral-600 leading-relaxed mb-8">{product.description}</p>

          {/* Add to Cart */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`flex-1 py-3.5 rounded-none text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                added 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-[#2aabb0] text-[#0a0e27] hover:bg-[#38C8CC]'
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
              className="py-3.5 px-6 border border-[#0a0e27] text-[#0a0e27] rounded-none text-xs font-bold uppercase tracking-wider hover:bg-[#0a0e27] hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Bulk Inquiry <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Sticky Mobile CTA Bar */}
          <div className="sm:hidden fixed bottom-[90px] left-4 right-4 z-40">
            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-[0_8px_30px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 ${
                added 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-[#0a0e27] text-white active:scale-[0.98]'
              }`}
            >
              {added ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingBag className="w-4 h-4" /> Add to Cart - ₹{product.price}</>}
            </button>
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
        <div className="mt-20">
          <h2 className="text-3xl font-serif-heading font-extrabold text-[#0a0e27] mb-8">Technical Specifications</h2>
          <div className="bg-white rounded-none border-y border-[#eaeaea]">
            <div className="divide-y divide-[#eaeaea]">
              {actualSpecs.map((spec: { label: string; value: string }, i: number) => (
                <div key={i} className="flex items-start gap-4 py-4">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#595959] w-48 shrink-0">{spec.label}</span>
                  <span className="text-sm text-[#0a0e27]">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {actualFaqs && actualFaqs.length > 0 && (
        <div className="mt-20 max-w-4xl">
          <h2 className="text-3xl font-serif-heading font-extrabold text-[#0a0e27] mb-8">Frequently Asked Questions</h2>
          <div className="border-t border-[#eaeaea]">
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
          <h2 className="text-3xl font-serif-heading font-extrabold text-[#0a0e27] mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(related => (
              <Link
                key={related.id}
                href={`/products/${related.slug}`}
                className="group bg-white rounded-none border-b border-[#eaeaea] overflow-hidden hover:border-[#0a0e27] transition-all pb-4"
              >
                <div className="aspect-[4/5] bg-[#FAFAFA] overflow-hidden">
                  <Image src={related.image_url} alt={related.title} width={400} height={500} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" unoptimized />
                </div>
                <div className="pt-4">
                  <h3 className="text-lg font-serif-heading font-extrabold text-[#0a0e27] line-clamp-1 mb-1">{related.title}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-[#0a0e27]">₹{related.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Add-To-Cart Bar */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.08)] p-3 md:hidden border-t border-neutral-200">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleAddToCart}
            disabled={added}
            className={`flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm ${
              added 
                ? 'bg-emerald-500 text-white' 
                : 'bg-[#2aabb0] text-[#0a0e27] active:bg-[#38C8CC]'
            }`}
          >
            {added ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingBag className="w-4 h-4" /> Quick Add</>}
          </button>
          <label
            className={`w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl border-2 border-emerald-500 cursor-pointer shadow-sm shrink-0 relative overflow-hidden ${isSharing ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isSharing} />
            <Camera className="w-5 h-5" />
          </label>
        </div>
      </div>

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
