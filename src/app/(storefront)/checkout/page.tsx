'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/components/storefront/CartContext';
import { useAuth } from '@/components/storefront/AuthContext';
import { submitOrder } from '@/lib/actions/checkout';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ShoppingBag, CheckCircle, ShieldCheck, User, Phone, Mail, MapPin, Building, LogIn, Check, Lock } from 'lucide-react';
import { StateAutocomplete } from '@/components/storefront/StateAutocomplete';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "PIN code must be at least 6 characters"),
});

export default function CheckoutPage() {
  const { items, clearCart, totalCount } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [settings, setSettings] = useState({
    delivery_charge: 500,
    free_shipping_threshold: 10000,
  });

  useEffect(() => {
    async function fetchSettings() {
      const supabase = createClient();
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        setSettings(prev => {
          const newSettings = { ...prev };
          data.forEach(item => {
            if (item.key === 'delivery_charge') newSettings.delivery_charge = Number((item.value as { text?: string })?.text) || 500;
            if (item.key === 'free_shipping_threshold') newSettings.free_shipping_threshold = Number((item.value as { text?: string })?.text) || 10000;
          });
          return newSettings;
        });
      }
    }
    fetchSettings();
  }, []);

  const handleBlur = (field: string, value: string) => {
    try {
      const fieldSchema = checkoutSchema.shape[field as keyof typeof checkoutSchema.shape];
      fieldSchema.parse(value);
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
      setValidFields(prev => ({ ...prev, [field]: true }));
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setFieldErrors(prev => ({ ...prev, [field]: err.issues[0]?.message || 'Invalid field' }));
        setValidFields(prev => ({ ...prev, [field]: false }));
      }
    }
  };

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  const [form, setForm] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.default_address || '',
    city: user?.default_city || '',
    state: user?.default_state || 'Tamil Nadu',
    pincode: user?.default_pincode || '',
  });

  const [isFocused, setIsFocused] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [validFields, setValidFields] = useState<Record<string, boolean>>({});

  // Auto-fill city + state from pincode using India Post API
  const lookupPincode = useCallback(async (pin: string) => {
    if (pin.length !== 6) return;
    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setForm(prev => ({
          ...prev,
          city: po.District || po.Name || prev.city,
          state: po.State || prev.state,
        }));
        setValidFields(prev => ({ ...prev, city: true, state: true, pincode: true }));
        toast.success(`📍 ${po.District || po.Name}, ${po.State}`);
      }
    } catch {
      // silently fail — user can still type manually
    } finally {
      setPincodeLoading(false);
    }
  }, []);

  // Auto-fill from customer profile
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setForm(prev => {
          const newForm = { ...prev };
          let hasChanges = false;
          
          if (user.full_name && !prev.name) { newForm.name = user.full_name; hasChanges = true; }
          if (user.email && !prev.email) { newForm.email = user.email; hasChanges = true; }
          if (user.phone && !prev.phone) { newForm.phone = user.phone; hasChanges = true; }
          if (user.default_address && !prev.address) { newForm.address = user.default_address; hasChanges = true; }
          if (user.default_city && !prev.city) { newForm.city = user.default_city; hasChanges = true; }
          if (user.default_state && prev.state === 'Tamil Nadu') { newForm.state = user.default_state; hasChanges = true; }
          if (user.default_pincode && !prev.pincode) { newForm.pincode = user.default_pincode; hasChanges = true; }

          return hasChanges ? newForm : prev;
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Sync abandoned cart contact info
  useEffect(() => {
    const syncContactInfo = async () => {
      if (!form.email && !form.phone) return;
      if (items.length === 0) return;
      
      try {
        let sessionId = localStorage.getItem('rcreation-session');
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          localStorage.setItem('rcreation-session', sessionId);
        }
        
        await fetch('/api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId, 
            email: form.email, 
            phone: form.phone,
            items 
          })
        });
      } catch { /* silently fail */ }
    };

    const timer = setTimeout(syncContactInfo, 2000);
    return () => clearTimeout(timer);
  }, [form.email, form.phone, items]);

  const getItemPrice = (item: { moq?: number; quantity: number; wholesale_price?: number; price: number }) => {
    return (item.moq && item.quantity >= item.moq && item.wholesale_price) ? item.wholesale_price : item.price;
  };

  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);
  const taxAmount = subtotal * 0.18;
  const shippingCost = (settings.free_shipping_threshold > 0 && subtotal >= settings.free_shipping_threshold) ? 0 : settings.delivery_charge;
  const total = subtotal + taxAmount + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      checkoutSchema.parse(form);
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach(issue => {
          if (issue.path[0]) {
            errors[issue.path[0].toString()] = issue.message;
          }
        });
        setFieldErrors(errors);
        setError("Please fix the errors in the form before continuing.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const cartPayload = items.map(i => ({ 
        id: i.id, 
        quantity: i.quantity,
        type: i.type,
        price: i.price,
        title: i.title,
        details: i.details,
        custom_config: i.customConfig
      }));
      const result = await submitOrder(form, cartPayload as Parameters<typeof submitOrder>[1], idempotencyKey);

      if (!result.success) {
        if (result.error === 'auth_required') {
          // Redirect to login with return URL
          router.push(`/auth/login?redirect=${encodeURIComponent('/checkout')}`);
          return;
        }
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }
      
      setOrderId(result.data?.orderId ?? null);
      setSuccess(true);
      
      // Mark abandoned cart as converted
      try {
        const sessionId = localStorage.getItem('rcreation-session');
        if (sessionId) {
          await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, status: 'converted', items: [] })
          });
        }
      } catch { /* ignore */ }
      
      clearCart();
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="pt-10 md:pt-32 pb-20 max-w-3xl mx-auto px-4 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-secondary mb-4">Order Placed Successfully!</h1>
        <p className="text-neutral-600 mb-2">Thank you for shopping with R Creation.</p>
        <p className="text-neutral-600 font-mono mb-8">Your Order ID is: <strong>{orderId}</strong></p>
        {user && (
          <p className="text-sm text-neutral-500 mb-4">You can track this order in <Link href="/account" className="text-accent font-bold hover:underline">My Account</Link>.</p>
        )}
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-hover transition-colors">
          <ArrowLeft className="w-4 h-4" /> Return to Store
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-10 md:pt-32 pb-20 max-w-3xl mx-auto px-4 text-center">
        <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-secondary mb-4">Your Cart is Empty</h1>
        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-hover transition-colors">
          <ArrowLeft className="w-4 h-4" /> Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-8 md:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      {/* HIG: Depth-of-Field Blurring */}
      <div className={`fixed inset-0 pointer-events-none transition-all duration-700 z-10 ${isFocused ? 'backdrop-blur-sm bg-neutral-900/10' : 'backdrop-blur-none bg-transparent'}`} />
      
      <div className="relative z-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-secondary">Secure Checkout</h1>
        <p className="text-sm text-neutral-600">Please provide your shipping and contact details below.</p>
      </div>

      {/* Trust bar — replaces misleading step indicator */}
      <div className="mb-8 flex items-center justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secure Checkout</span>
        </div>
        <div className="hidden sm:block w-px h-4 bg-neutral-200" />
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
          <span>COD Available</span>
        </div>
        <div className="hidden sm:block w-px h-4 bg-neutral-200" />
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span>No Hidden Fees</span>
        </div>
      </div>

      {/* Auth Status Banner */}
      {!authLoading && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
          user
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          {user ? (
            <>
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-black shrink-0">
                {user.full_name?.charAt(0)?.toUpperCase() || '✓'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-emerald-800">Signed in as {user.full_name || user.email}</p>
                <p className="text-xs text-emerald-600">Your details have been auto-filled from your profile.</p>
              </div>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-800">Guest Checkout</p>
                <p className="text-xs text-amber-600">
                  <Link href={`/auth/login?redirect=${encodeURIComponent('/checkout')}`} className="font-bold underline hover:text-amber-700">Sign in</Link>{' '}
                  to auto-fill your details and track your orders.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Checkout Form */}
        <div className="lg:col-span-7">
          <form 
            id="checkout-form" 
            onSubmit={handleSubmit} 
            onFocusCapture={() => setIsFocused(true)}
            onBlurCapture={(e) => { 
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsFocused(false); 
            }}
            className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm relative z-30"
          >
            
            <fieldset className="border-0 p-0 m-0">
              <legend className="text-lg font-bold text-secondary mb-4 border-b border-neutral-100 pb-2 w-full">1. Contact Information</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="relative">
                  <label htmlFor="checkout-name" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input id="checkout-name" type="text" autoComplete="name" required value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      onBlur={e => handleBlur('name', e.target.value)}
                      aria-describedby={fieldErrors.name ? 'checkout-name-error' : undefined}
                      aria-invalid={!!fieldErrors.name || undefined}
                      className={`w-full pl-10 pr-9 py-2.5 bg-neutral-50 border rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all ${
                        fieldErrors.name ? 'border-red-500 ring-1 ring-red-500' : validFields.name ? 'border-emerald-400' : 'border-neutral-300'
                      }`} />
                    {validFields.name && !fieldErrors.name && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
                  </div>
                  {fieldErrors.name && <p id="checkout-name-error" className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                </div>

                {/* Phone with +91 prefix */}
                <div className="relative">
                  <label htmlFor="checkout-phone" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">Mobile Number *</label>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-xl text-sm font-bold text-neutral-600 shrink-0">+91</span>
                    <div className="relative flex-1">
                      <input id="checkout-phone" type="tel" inputMode="numeric" autoComplete="tel" required
                        value={form.phone.replace(/^\+91\s?/, '')}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setForm({...form, phone: digits});
                        }}
                        onBlur={e => handleBlur('phone', e.target.value)}
                        placeholder="98765 43210"
                        aria-describedby={fieldErrors.phone ? 'checkout-phone-error' : undefined}
                        aria-invalid={!!fieldErrors.phone || undefined}
                        className={`w-full pl-3.5 pr-9 py-2.5 bg-neutral-50 border rounded-r-xl text-base sm:text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all ${
                          fieldErrors.phone ? 'border-red-500 ring-1 ring-red-500' : validFields.phone ? 'border-emerald-400' : 'border-neutral-300'
                        }`} />
                      {validFields.phone && !fieldErrors.phone && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
                    </div>
                  </div>
                  {fieldErrors.phone && <p id="checkout-phone-error" className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                </div>

                {/* Email */}
                <div className="sm:col-span-2 relative">
                  <label htmlFor="checkout-email" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input id="checkout-email" type="email" autoComplete="email" required value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      onBlur={e => handleBlur('email', e.target.value)}
                      aria-describedby={fieldErrors.email ? 'checkout-email-error' : undefined}
                      aria-invalid={!!fieldErrors.email || undefined}
                      className={`w-full pl-10 pr-9 py-2.5 bg-neutral-50 border rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all ${
                        fieldErrors.email ? 'border-red-500 ring-1 ring-red-500' : validFields.email ? 'border-emerald-400' : 'border-neutral-300'
                      }`} />
                    {validFields.email && !fieldErrors.email && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
                  </div>
                  {fieldErrors.email && <p id="checkout-email-error" className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                </div>
              </div>
            </fieldset>

            <fieldset className="border-0 p-0 m-0">
              <legend className="text-lg font-bold text-secondary mb-4 border-b border-neutral-100 pb-2 w-full">2. Shipping Address</legend>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm mb-6">
                <span className="font-bold">Delivery Notice:</span> We currently only deliver to Vellore, Gudiyattam, and surrounding areas within a 40km radius.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Pincode FIRST — triggers auto-fill */}
                <div className="relative">
                  <label htmlFor="checkout-pincode" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">
                    PIN Code *
                    {pincodeLoading && <span className="ml-2 text-[10px] text-neutral-400 font-normal">Looking up…</span>}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input id="checkout-pincode" type="text" inputMode="numeric" autoComplete="postal-code" required
                      maxLength={6}
                      value={form.pincode}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setForm({...form, pincode: val});
                        if (val.length === 6) lookupPincode(val);
                      }}
                      onBlur={e => handleBlur('pincode', e.target.value)}
                      placeholder="e.g. 635802"
                      aria-describedby={fieldErrors.pincode ? 'checkout-pincode-error' : undefined}
                      aria-invalid={!!fieldErrors.pincode || undefined}
                      className={`w-full pl-10 pr-9 py-2.5 bg-neutral-50 border rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all ${
                        fieldErrors.pincode ? 'border-red-500 ring-1 ring-red-500' : validFields.pincode ? 'border-emerald-400' : 'border-neutral-300'
                      }`} />
                    {validFields.pincode && !fieldErrors.pincode && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
                  </div>
                  {fieldErrors.pincode && <p id="checkout-pincode-error" className="text-red-500 text-xs mt-1">{fieldErrors.pincode}</p>}
                </div>

                {/* City — auto-filled by pincode */}
                <div className="relative">
                  <label htmlFor="checkout-city" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">City / District *</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input id="checkout-city" type="text" autoComplete="address-level2" required value={form.city}
                      onChange={e => setForm({...form, city: e.target.value})}
                      onBlur={e => handleBlur('city', e.target.value)}
                      placeholder="Auto-filled from PIN"
                      aria-describedby={fieldErrors.city ? 'checkout-city-error' : undefined}
                      aria-invalid={!!fieldErrors.city || undefined}
                      className={`w-full pl-10 pr-9 py-2.5 bg-neutral-50 border rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all ${
                        fieldErrors.city ? 'border-red-500 ring-1 ring-red-500' : validFields.city ? 'border-emerald-400' : 'border-neutral-300'
                      }`} />
                    {validFields.city && !fieldErrors.city && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
                  </div>
                  {fieldErrors.city && <p id="checkout-city-error" className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>}
                </div>

                {/* Delivery address — full width */}
                <div className="sm:col-span-2 relative">
                  <label htmlFor="checkout-address" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">House / Flat No. &amp; Street *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                    <input id="checkout-address" type="text" autoComplete="street-address" required value={form.address}
                      onChange={e => setForm({...form, address: e.target.value})}
                      onBlur={e => handleBlur('address', e.target.value)}
                      placeholder="e.g. 12B, Gandhi Nagar, Near Bus Stand"
                      aria-describedby={fieldErrors.address ? 'checkout-address-error' : undefined}
                      aria-invalid={!!fieldErrors.address || undefined}
                      className={`w-full pl-10 pr-9 py-2.5 bg-neutral-50 border rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all ${
                        fieldErrors.address ? 'border-red-500 ring-1 ring-red-500' : validFields.address ? 'border-emerald-400' : 'border-neutral-300'
                      }`} />
                    {validFields.address && !fieldErrors.address && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
                  </div>
                  {fieldErrors.address && <p id="checkout-address-error" className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>}
                </div>

                {/* State — searchable autocomplete */}
                <div className="sm:col-span-2 relative">
                  <label htmlFor="state-autocomplete" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">State *</label>
                  <StateAutocomplete
                    id="state-autocomplete"
                    value={form.state}
                    onChange={val => setForm({...form, state: val})}
                    onBlur={() => handleBlur('state', form.state)}
                    hasError={!!fieldErrors.state}
                    ariaDescribedBy={fieldErrors.state ? 'checkout-state-error' : undefined}
                  />
                  {fieldErrors.state && <p id="checkout-state-error" className="text-red-500 text-xs mt-1">{fieldErrors.state}</p>}
                </div>

              </div>
            </fieldset>

            {/* Payment Info placeholder */}
            <fieldset className="border-0 p-0 m-0">
              <legend className="text-lg font-bold text-secondary mb-4 border-b border-neutral-100 pb-2 w-full">3. Payment</legend>
              <label className="cursor-pointer group flex items-start gap-4 p-4 border-2 border-accent bg-accent/5 rounded-xl transition-all shadow-[0_0_15px_rgba(42,171,176,0.1)]">
                <div className="mt-0.5">
                  <div className="w-5 h-5 rounded-full border-2 border-accent flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-bold text-secondary">Cash on Delivery (COD)</h3>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Pay with cash or UPI when your order arrives. Standard integration for payment gateways can be activated from the admin panel later.
                  </p>
                </div>
              </label>
            </fieldset>

            {error && (
              <div role="alert" className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-200">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-surface-muted p-6 rounded-2xl border border-neutral-200 sticky top-24">
            <h2 className="text-lg font-bold text-secondary mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden shrink-0 relative">
                    <Image src={item.image || '/images/placeholder.jpg'} alt={item.title} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-secondary line-clamp-2">{item.title}</h4>
                    <p className="text-[10px] text-neutral-500 mt-1">Qty: {item.quantity}</p>
                    {item.moq && item.quantity >= item.moq && item.wholesale_price && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5 animate-in fade-in slide-in-from-top-1">
                        Wholesale Discount Applied
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end text-sm font-bold font-mono text-secondary">
                    {item.moq && item.quantity >= item.moq && item.wholesale_price && (
                      <span className="text-[10px] line-through text-neutral-400">₹{(item.price * item.quantity).toLocaleString()}</span>
                    )}
                    <span className={item.moq && item.quantity >= item.moq && item.wholesale_price ? 'text-emerald-600' : ''}>
                      ₹{(getItemPrice(item) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal ({totalCount} items)</span>
                <span className="font-bold font-mono text-secondary tabular">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">GST (18%)</span>
                <span className="font-bold font-mono text-secondary tabular">₹{taxAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Shipping</span>
                <span className="font-bold font-mono text-secondary tabular">{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between text-lg pt-3 border-t border-neutral-200">
                <span className="font-extrabold text-secondary">Total</span>
                <span className="font-black font-mono text-accent tabular">₹{total}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full py-4 bg-secondary text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-secondary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {isSubmitting ? 'Processing...' : 'Place Order (COD)'}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
