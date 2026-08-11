'use client';

import React from 'react';
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useCart } from './CartContext';
import Link from 'next/link';
import Image from 'next/image';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, clearCart, moqWarnings } = useCart();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#2aabb0]" />
            <h2 className="text-lg font-extrabold text-[#10164A]">Order Cart</h2>
            <span className="text-xs font-mono text-neutral-500">({totalItems} items)</span>
          </div>
          <button onClick={closeCart} aria-label="Close cart" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 px-6 space-y-4">
              <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-neutral-100 shadow-sm">
                <ShoppingBag className="w-10 h-10 text-neutral-300" />
              </div>
              <h3 className="text-lg font-extrabold text-[#10164A]">Your cart is empty</h3>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-[200px] mx-auto">
                Looks like you haven&apos;t added anything to your cart yet.
              </p>
              <button onClick={closeCart} className="mt-4 px-6 py-3 bg-[#10164A] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#1c246e] transition-colors inline-block">
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
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
                  <h4 className="text-xs font-bold text-[#10164A] line-clamp-1">{item.title}</h4>
                  {item.details && (
                    <p className="text-[10px] text-neutral-500 font-mono line-clamp-1 mt-0.5">{item.details}</p>
                  )}
                  {item.moq && item.quantity < item.moq && (
                    <p className="text-[10px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> MOQ: {item.moq} min
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        aria-label="Decrease quantity"
                        className="w-11 h-11 flex items-center justify-center hover:bg-neutral-100 rounded-l-lg"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold font-mono">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label="Increase quantity"
                        className="w-11 h-11 flex items-center justify-center hover:bg-neutral-100 rounded-r-lg"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-[#10164A]">₹{item.price * item.quantity}</span>
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
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-neutral-200 space-y-4">
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
            <div className="space-y-2 pb-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Free Shipping</span>
                <span className="text-[10px] font-mono text-[#2aabb0] font-bold">
                  {subtotal >= 10000 ? 'Unlocked!' : `₹${(10000 - subtotal).toLocaleString()} away`}
                </span>
              </div>
              <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#2aabb0] transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min((subtotal / 10000) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Subtotal ({totalItems} items):</span>
              <span className="text-xl font-extrabold text-[#10164A] font-mono">₹{subtotal.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-neutral-500 font-mono">
              GST (18%) applicable. Shipping calculated at inquiry.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full py-3.5 bg-[#10164A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1c246e] transition-colors flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={clearCart}
              className="w-full py-2 text-xs font-mono text-neutral-500 hover:text-red-500 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
