'use client';

import React, { useState } from 'react';
import { trackOrder, type TrackingData } from '@/lib/actions/tracking';
import { Package, Search, ChevronRight, CheckCircle2, Clock, Truck, Home } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackingData | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !contact) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await trackOrder(orderId, contact);
      if (!res.success) {
        setError(res.error || 'Failed to track order');
        toast.error(res.error || 'Order not found');
      } else {
        setData(res.data || null);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 1;
      case 'confirmed': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const step = data ? getStatusStep(data.status) : 0;

  return (
    <div className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-secondary mb-4 tracking-tight">Track Your Order</h1>
        <p className="text-neutral-600 max-w-xl mx-auto text-sm md:text-base">
          Enter your Order ID and the email address or phone number you used during checkout to see the current status of your shipment.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-neutral-200 shadow-sm mb-8 relative z-20">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="flex-1">
            <label htmlFor="orderId" className="sr-only">Order ID</label>
            <input
              id="orderId"
              type="text"
              placeholder="Order ID (e.g., ORD-12345)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              required
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="contact" className="sr-only">Email or Phone</label>
            <input
              id="contact"
              type="text"
              placeholder="Email or Phone Number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap"
          >
            {loading ? 'Searching...' : (
              <>
                <Search className="w-4 h-4" /> Track
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-200 max-w-2xl mx-auto text-center">
            {error}
          </div>
        )}
      </div>

      {data && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-surface-muted p-6 sm:px-8 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Order Details</p>
              <h2 className="text-xl font-bold text-secondary font-mono">{data.order_number}</h2>
              <p className="text-sm text-neutral-600 mt-1">Placed on {new Date(data.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Status</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                {data.status}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {/* Timeline UI */}
            <div className="relative mb-12 max-w-3xl mx-auto">
              {/* Progress Line */}
              <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-neutral-200 rounded-full hidden sm:block" />
              <div 
                className="absolute top-5 left-[10%] h-1 bg-emerald-500 rounded-full transition-all duration-700 hidden sm:block" 
                style={{ width: `${Math.min(((step - 1) / 3) * 80, 80)}%` }} 
              />

              <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-8 sm:gap-0">
                <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${step >= 1 ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-neutral-100 text-neutral-400'}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-left sm:text-center">
                    <p className={`text-sm font-bold ${step >= 1 ? 'text-secondary' : 'text-neutral-400'}`}>Confirmed</p>
                    <p className="text-xs text-neutral-500 hidden sm:block mt-0.5">Order Received</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${step >= 2 ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-neutral-100 text-neutral-400'}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="text-left sm:text-center">
                    <p className={`text-sm font-bold ${step >= 2 ? 'text-secondary' : 'text-neutral-400'}`}>Processing</p>
                    <p className="text-xs text-neutral-500 hidden sm:block mt-0.5">Being customized</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${step >= 3 ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-neutral-100 text-neutral-400'}`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="text-left sm:text-center">
                    <p className={`text-sm font-bold ${step >= 3 ? 'text-secondary' : 'text-neutral-400'}`}>Shipped</p>
                    <p className="text-xs text-neutral-500 hidden sm:block mt-0.5">Out for delivery</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${step >= 4 ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-neutral-100 text-neutral-400'}`}>
                    <Home className="w-5 h-5" />
                  </div>
                  <div className="text-left sm:text-center">
                    <p className={`text-sm font-bold ${step >= 4 ? 'text-secondary' : 'text-neutral-400'}`}>Delivered</p>
                    <p className="text-xs text-neutral-500 hidden sm:block mt-0.5">Arrived</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-8 mt-8">
              <h3 className="text-lg font-bold text-secondary mb-4">Items Ordered</h3>
              <div className="space-y-4">
                {data.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-neutral-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-neutral-200 rounded-lg flex items-center justify-center text-secondary font-bold text-sm shrink-0">
                        x{item.quantity}
                      </div>
                      <span className="text-sm font-medium text-secondary">{item.title}</span>
                    </div>
                    <span className="text-sm font-bold text-secondary font-mono">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-neutral-100">
                <span className="text-neutral-600 font-bold">Total Paid</span>
                <span className="text-xl font-black text-secondary font-mono">₹{data.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Helper */}
      <div className="text-center mt-12">
        <p className="text-sm text-neutral-500">
          Need help with your order? <Link href="/contact" className="text-accent font-bold hover:underline">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}
