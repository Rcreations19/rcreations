'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/components/storefront/CartContext';
import { useAuth } from '@/components/storefront/AuthContext';
import { submitOrder } from '@/lib/actions/checkout';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ShoppingBag, CheckCircle, ShieldCheck, User, Phone, Mail, MapPin, Building, Map, LogIn } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { z } from 'zod';

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

  const handleBlur = (field: string, value: string) => {
    try {
      const fieldSchema = checkoutSchema.shape[field as keyof typeof checkoutSchema.shape];
      fieldSchema.parse(value);
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setFieldErrors(prev => ({ ...prev, [field]: err.issues[0]?.message || 'Invalid field' }));
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

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = subtotal * 0.18;
  const shippingCost = subtotal > 10000 ? 0 : 500;
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
      const cartPayload = items.map(i => ({ id: i.id, quantity: i.quantity }));
      const result = await submitOrder(form, cartPayload, idempotencyKey) as { success?: boolean; orderId?: string; error?: string };

      if (result?.error === 'auth_required') {
        // Redirect to login with return URL
        router.push(`/auth/login?redirect=${encodeURIComponent('/checkout')}`);
        return;
      }
      
      if (result?.success) {
        setOrderId(result.orderId ?? null);
        setSuccess(true);
        clearCart();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to place order. Please try again.');
      }
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
          <p className="text-sm text-neutral-500 mb-4">You can track this order in <Link href="/account" className="text-[#2aabb0] font-bold hover:underline">My Account</Link>.</p>
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
    <div className="pt-8 md:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-secondary">Secure Checkout</h1>
        <p className="text-sm text-neutral-600">Please provide your shipping and contact details below.</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2 max-w-md mx-auto">
        {[
          { num: 1, label: 'Contact' },
          { num: 2, label: 'Shipping' },
          { num: 3, label: 'Payment' },
        ].map((step, i) => (
          <React.Fragment key={step.num}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold">
                {step.num}
              </div>
              <span className="text-xs font-bold text-secondary hidden sm:block">{step.label}</span>
            </div>
            {i < 2 && <div className="w-8 sm:w-12 h-0.5 bg-neutral-200 mx-1" />}
          </React.Fragment>
        ))}
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
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm">
            
            {/* Contact Info */}
            <fieldset className="border-0 p-0 m-0">
              <legend className="text-lg font-bold text-secondary mb-4 border-b border-neutral-100 pb-2 w-full">1. Contact Information</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="checkout-name" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input id="checkout-name" type="text" autoComplete="name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} onBlur={e => handleBlur('name', e.target.value)}
                      aria-describedby={fieldErrors.name ? 'checkout-name-error' : undefined}
                      aria-invalid={!!fieldErrors.name || undefined}
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border ${fieldErrors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-300'} rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all`} />
                  </div>
                  {fieldErrors.name && <p id="checkout-name-error" className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                </div>
                <div className="relative">
                  <label htmlFor="checkout-phone" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input id="checkout-phone" type="tel" inputMode="tel" autoComplete="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} onBlur={e => handleBlur('phone', e.target.value)}
                      aria-describedby={fieldErrors.phone ? 'checkout-phone-error' : undefined}
                      aria-invalid={!!fieldErrors.phone || undefined}
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border ${fieldErrors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-300'} rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all`} />
                  </div>
                  {fieldErrors.phone && <p id="checkout-phone-error" className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                </div>
                <div className="sm:col-span-2 relative">
                  <label htmlFor="checkout-email" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input id="checkout-email" type="email" autoComplete="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} onBlur={e => handleBlur('email', e.target.value)}
                      aria-describedby={fieldErrors.email ? 'checkout-email-error' : undefined}
                      aria-invalid={!!fieldErrors.email || undefined}
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border ${fieldErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-300'} rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all`} />
                  </div>
                  {fieldErrors.email && <p id="checkout-email-error" className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                </div>
              </div>
            </fieldset>

            {/* Shipping Info */}
            <fieldset className="border-0 p-0 m-0">
              <legend className="text-lg font-bold text-secondary mb-4 border-b border-neutral-100 pb-2 w-full">2. Shipping Address</legend>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm mb-6">
                <span className="font-bold">Delivery Notice:</span> We currently only deliver to Vellore, Gudiyattam, and surrounding areas within a 40km radius.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 relative">
                  <label htmlFor="checkout-address" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                    <input id="checkout-address" type="text" autoComplete="street-address" required value={form.address} onChange={e => setForm({...form, address: e.target.value})} onBlur={e => handleBlur('address', e.target.value)}
                      aria-describedby={fieldErrors.address ? 'checkout-address-error' : undefined}
                      aria-invalid={!!fieldErrors.address || undefined}
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border ${fieldErrors.address ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-300'} rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all`} />
                  </div>
                  {fieldErrors.address && <p id="checkout-address-error" className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>}
                </div>
                <div className="relative">
                  <label htmlFor="checkout-city" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">City *</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input id="checkout-city" type="text" autoComplete="address-level2" required value={form.city} onChange={e => setForm({...form, city: e.target.value})} onBlur={e => handleBlur('city', e.target.value)}
                      aria-describedby={fieldErrors.city ? 'checkout-city-error' : undefined}
                      aria-invalid={!!fieldErrors.city || undefined}
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border ${fieldErrors.city ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-300'} rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all`} />
                  </div>
                  {fieldErrors.city && <p id="checkout-city-error" className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>}
                </div>
                <div className="relative">
                  <label htmlFor="checkout-state" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">State *</label>
                  <div className="relative">
                    <Map className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input id="checkout-state" type="text" autoComplete="address-level1" required value={form.state} onChange={e => setForm({...form, state: e.target.value})} onBlur={e => handleBlur('state', e.target.value)}
                      aria-describedby={fieldErrors.state ? 'checkout-state-error' : undefined}
                      aria-invalid={!!fieldErrors.state || undefined}
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border ${fieldErrors.state ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-300'} rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all`} />
                  </div>
                  {fieldErrors.state && <p id="checkout-state-error" className="text-red-500 text-xs mt-1">{fieldErrors.state}</p>}
                </div>
                <div className="relative">
                  <label htmlFor="checkout-pincode" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">PIN Code *</label>
                  <input id="checkout-pincode" type="text" inputMode="numeric" autoComplete="postal-code" required value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} onBlur={e => handleBlur('pincode', e.target.value)}
                    aria-describedby={fieldErrors.pincode ? 'checkout-pincode-error' : undefined}
                    aria-invalid={!!fieldErrors.pincode || undefined}
                    className={`w-full px-3.5 py-2.5 bg-neutral-50 border ${fieldErrors.pincode ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-300'} rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all`} />
                  {fieldErrors.pincode && <p id="checkout-pincode-error" className="text-red-500 text-xs mt-1">{fieldErrors.pincode}</p>}
                </div>
              </div>
            </fieldset>

            {/* Payment Info placeholder */}
            <fieldset className="border-0 p-0 m-0">
              <legend className="text-lg font-bold text-secondary mb-4 border-b border-neutral-100 pb-2 w-full">3. Payment</legend>
              <label className="cursor-pointer group flex items-start gap-4 p-4 border-2 border-[#2aabb0] bg-[#2aabb0]/5 rounded-xl transition-all shadow-[0_0_15px_rgba(42,171,176,0.1)]">
                <div className="mt-0.5">
                  <div className="w-5 h-5 rounded-full border-2 border-[#2aabb0] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2aabb0]"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#2aabb0]" />
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
          <div className="bg-[#f8f9fa] p-6 rounded-2xl border border-neutral-200 sticky top-24">
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
                  </div>
                  <div className="text-sm font-bold font-mono text-secondary">
                    ₹{item.price * item.quantity}
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
                <span className="font-black font-mono text-[#2aabb0] tabular">₹{total}</span>
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
  );
}
