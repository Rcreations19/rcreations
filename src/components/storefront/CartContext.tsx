'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { CartItem, CustomFrameConfig } from '@/lib/supabase/types';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalCount: number;
  openCart: () => void;
  closeCart: () => void;
  addPreset: (product: { id: string; title: string; price: number; wholesale_price?: number; image: string; subtitle: string; moq: number }, qty?: number, customText?: string) => void;
  addCustom: (config: CustomFrameConfig, price: number, image?: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  moqWarnings: string[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'rcreation-cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    
    let items = JSON.parse(stored) as CartItem[];
    
    // Retroactively fix any existing items that were saved with the broken direct Supabase URL
    items = items.map(item => {
      if (item.type === 'custom' && item.image && item.image.includes('/storage/v1/object/public/customer-uploads/')) {
         if (item.customConfig?.uploadedPhotoUrl) {
            item.image = `/api/secure-image?path=${encodeURIComponent(item.customConfig.uploadedPhotoUrl)}`;
         }
      }
      return item;
    });
    
    return items;
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable
  }
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addPreset = useCallback((
    product: { id: string; title: string; price: number; wholesale_price?: number; image: string; subtitle: string; moq: number },
    qty = 1,
    customText?: string
  ) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, {
        id: product.id,
        title: product.title,
        price: product.price,
        wholesale_price: product.wholesale_price,
        image: product.image,
        type: 'catalog' as const,
        quantity: qty,
        details: `${product.subtitle} • MOQ ${product.moq}${customText ? ` • Engraving: "${customText}"` : ''}`,
        moq: product.moq,
      }];
    });
    setIsOpen(true);
  }, []);

  const addCustom = useCallback((config: CustomFrameConfig, price: number, image?: string) => {
    const id = `custom-frame-${Date.now()}`;
    const qty = config.quantity || 1;
    
    // Construct the proxy URL if uploadedPhotoUrl is available and no direct image was provided
    let finalImage = image;
    if (!finalImage && config.uploadedPhotoUrl) {
      finalImage = `/api/secure-image?path=${encodeURIComponent(config.uploadedPhotoUrl)}`;
    }
    
    setItems(prev => [...prev, {
      id,
      title: 'Custom Frame / Memento Order',
      price: Math.round(price / qty),
      image: finalImage || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop',
      type: 'custom' as const,
      quantity: qty,
      details: `${config.widthCm}x${config.heightCm} cm • ${config.glassType} • Custom Laser Engraved`,
      customConfig: config,
      moq: 1,
    }]);
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const moqWarnings = useMemo(() =>
    items
      .filter(i => i.moq && i.quantity < i.moq)
      .map(i => `${i.title}: minimum ${i.moq} units (currently ${i.quantity})`),
    [items]
  );

  const value = useMemo(() => ({
    items, isOpen, totalCount, openCart, closeCart, addPreset, addCustom, updateQuantity, removeItem, clearCart, moqWarnings
  }), [items, isOpen, totalCount, openCart, closeCart, addPreset, addCustom, updateQuantity, removeItem, clearCart, moqWarnings]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
