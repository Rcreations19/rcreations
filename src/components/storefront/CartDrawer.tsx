'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag, AlertTriangle, ShieldCheck, Lock, Gift } from 'lucide-react';
import { useCart } from './CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, clearCart, moqWarnings, addPreset } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [settings, setSettings] = useState({
    delivery_charge: 500,
    free_shipping_threshold: 10000,
    gift_packing_charge: 250
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        setSettings((prev: any) => {
          const newSettings = { ...prev };
          data.forEach(item => {
            if (item.key === 'delivery_charge') newSettings.delivery_charge = Number((item.value as any)?.text) || 500;
            if (item.key === 'free_shipping_threshold') newSettings.free_shipping_threshold = Number((item.value as any)?.text) || 10000;
            if (item.key === 'gift_packing_charge') newSettings.gift_packing_charge = Number((item.value as any)?.text) || 250;
          });
          return newSettings;
        });
      }
    }
    fetchSettings();
  }, []);

  const getItemPrice = (item: any) => {
    return (item.moq && item.quantity >= item.moq && item.wholesale_price) ? item.wholesale_price : item.price;
  };

  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      closeCart();
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
      document.body.classList.add('scroll-locked');
      closeButtonRef.current?.focus();
    } else {
      dialog.close();
      document.body.classList.remove('scroll-locked');
    }
    return () => document.body.classList.remove('scroll-locked');
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => closeCart();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [closeCart]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Shopping cart"
      className="backdrop:bg-black/60 p-0 m-0 mt-auto md:mt-0 ml-auto md:mr-0 w-full md:max-w-md h-[85vh] md:h-full bg-transparent shadow-none rounded-t-3xl md:rounded-none overflow-hidden"
      onClick={handleBackdropClick}
    >
      {/* Drawer */}
      <div className="h-full bg-white shadow-2xl flex flex-col animate-slide-up md:animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-extrabold text-secondary">Order Cart</h2>
            <span className="text-xs font-mono text-neutral-500">({totalItems} items)</span>
          </div>
          <button ref={closeButtonRef} onClick={closeCart} aria-label="Close cart" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 px-6 space-y-4">
              <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-neutral-100 shadow-sm">
                <ShoppingBag className="w-10 h-10 text-neutral-300" />
              </div>
              <h3 className="text-lg font-extrabold text-secondary">Your cart is empty</h3>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-[200px] mx-auto">
                Looks like you haven&apos;t added anything to your cart yet.
              </p>
              <button onClick={closeCart} className="mt-4 px-6 py-3 bg-secondary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-secondary-hover transition-colors inline-block">
                Start Shopping
              </button>
            </div>
          ) : (
            <AnimatePresence>
            {items.map((item) => (
              <motion.div 
                key={item.id} 
                className="flex gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100"
                layout
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 200, transition: { duration: 0.2 } }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = offset.x;
                  if (swipe > 100 || (swipe > 50 && velocity.x > 500)) {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([15, 30, 15]);
                    removeItem(item.id);
                  } else if (swipe < -100 || (swipe < -50 && velocity.x < -500)) {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([15, 30, 15]);
                    removeItem(item.id);
                  }
                }}
              >
                <div className="relative w-16 h-16 shrink-0">
                  <Image
                    src={item.image || '/images/placeholder.jpg'}
                    alt={item.title}
                    fill
                    sizes="64px"
                    className="object-cover rounded-lg bg-neutral-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-secondary line-clamp-1">{item.title}</h4>
                  {item.details && (
                    <p className="text-[10px] text-neutral-500 font-mono line-clamp-1 mt-0.5">{item.details}</p>
                  )}
                  {item.moq && item.quantity < item.moq && (
                    <p className="text-[10px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> MOQ: {item.moq} min for Wholesale
                    </p>
                  )}
                  {item.moq && item.quantity >= item.moq && item.wholesale_price && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      <ShieldCheck className="w-3 h-3" /> Wholesale Discount Applied!
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        aria-label="Decrease quantity"
                        className="w-11 h-11 flex items-center justify-center hover:bg-neutral-100 rounded-l-lg active:bg-neutral-200 transition-colors"
                      >
                        <Minus className="w-4 h-4 md:w-3 md:h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold font-mono">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label="Increase quantity"
                        className="w-11 h-11 flex items-center justify-center hover:bg-neutral-100 rounded-r-lg active:bg-neutral-200 transition-colors"
                      >
                        <Plus className="w-4 h-4 md:w-3 md:h-3" />
                      </button>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      {item.moq && item.quantity >= item.moq && item.wholesale_price && (
                        <span className="text-[10px] line-through text-neutral-400 font-mono">₹{(item.price * item.quantity).toLocaleString()}</span>
                      )}
                      <span className={`text-sm font-bold font-mono ${item.moq && item.quantity >= item.moq && item.wholesale_price ? 'text-emerald-600' : 'text-secondary'}`}>
                        ₹{(getItemPrice(item) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.title}`}
                        className="p-2 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
            }
            </AnimatePresence>
          )}
        </div>

        {/* Upsell / Cross-sell (CRO) */}
        {items.length > 0 && (
          <div className="mx-5 mb-2 bg-surface-muted border border-border p-3 rounded-xl flex flex-row sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="w-12 h-12 bg-white rounded-lg border border-border flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-primary">Premium Gift Box</h4>
              <p className="text-[10px] text-neutral-500 line-clamp-1">Velvet lined, ribbon tie</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs font-black font-mono text-primary">₹{settings.gift_packing_charge}</span>
              <button onClick={() => {
                addPreset({ id: 'gift-box', title: 'Premium Gift Box', price: settings.gift_packing_charge, image: '/images/placeholder.jpg', subtitle: 'Velvet lined, ribbon tie', moq: 1 });
                toast.success('Gift box added to cart');
              }} className="text-[10px] font-bold uppercase tracking-wider bg-white border border-border px-3 py-1.5 rounded-lg hover:bg-[#eaeaea] active:bg-neutral-200 transition-colors min-h-[36px]">
                Add
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 md:p-5 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-neutral-200 space-y-4">
            {/* MOQ Warnings */}
            {moqWarnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                {moqWarnings.map((warning, i) => (
                  <p key={i} className="text-[10px] text-amber-700 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {warning}
                  </p>
                ))}
              </div>
            )}

            {/* Shipping Progress */}
            {settings.free_shipping_threshold > 0 && (
              <div className="space-y-2 pb-2">
                  <div className="flex justify-between items-center text-sm font-semibold text-primary mb-2">
                    <span>{subtotal >= settings.free_shipping_threshold ? '🎉 You qualify for Free Shipping!' : 'Almost there!'}</span>
                    <span className="opacity-60 font-medium">
                      {subtotal >= settings.free_shipping_threshold ? 'Free Shipping Earned' : `₹${(settings.free_shipping_threshold - subtotal).toLocaleString()} away`}
                    </span>
                  </div>
                <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min((subtotal / settings.free_shipping_threshold) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Subtotal ({totalItems} items):</span>
              <span className="text-xl font-extrabold text-secondary font-mono">₹{subtotal.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-neutral-500 font-mono">
              GST (18%) applicable. Shipping calculated at inquiry.
            </p>
            <Link
              href="/checkout"
              onClick={(e) => {
                // Simulated friction (haptics)
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate([15, 30, 15]);
                }
                closeCart();
              }}
              className="w-full py-3.5 bg-secondary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-secondary-hover transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 py-2 border-t border-neutral-100">
              <div className="flex items-center gap-1.5 text-neutral-500">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span className="text-[9px] uppercase tracking-wider font-bold">Secure Payment</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Gift className="w-4 h-4 text-accent" />
                <span className="text-[9px] uppercase tracking-wider font-bold">Safe Packaging</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Remove all items from your cart?')) {
                  clearCart();
                }
              }}
              className="w-full py-2 text-xs font-mono text-neutral-500 hover:text-red-500 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
