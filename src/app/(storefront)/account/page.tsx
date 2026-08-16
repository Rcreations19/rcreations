'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/storefront/AuthContext';
import { updateCustomerProfile } from '@/lib/actions/customer-profile';
import { User, Mail, Phone, MapPin, Building, Map, Save, LogOut, Package, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AccountPage() {
  const { user, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
  });

  // Populate form with user data
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.full_name || '',
        phone: user.phone || '',
        address: user.default_address || '',
        city: user.default_city || '',
        state: user.default_state || 'Tamil Nadu',
        pincode: user.default_pincode || '',
      });
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/account');
    }
  }, [isLoading, user, router]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      setOrdersLoading(true);
      const fetchOrders = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from('orders')
          .select('id, order_number, status, total, created_at, customer_name')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });
        setOrders(data || []);
        setOrdersLoading(false);
      };
      fetchOrders();
    }
  }, [activeTab, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const formData = new FormData();
    formData.append('fullName', form.fullName);
    formData.append('phone', form.phone);
    formData.append('address', form.address);
    formData.append('city', form.city);
    formData.append('state', form.state);
    formData.append('pincode', form.pincode);

    await updateCustomerProfile(formData);
    await refreshUser();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading || !user) {
    return (
      <div className="pt-32 pb-20 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#2aabb0]" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Store
          </Link>
          <h1 className="text-2xl font-extrabold text-[#10164A]">My Account</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your profile and view order history.</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl mb-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-white text-[#10164A] shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <User className="w-4 h-4" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-white text-[#10164A] shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <Package className="w-4 h-4" />
          Orders
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#10164A] mb-1">Personal Information</h2>
            <p className="text-xs text-neutral-500">Update your name, phone, and default shipping address.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="account-fullName" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input id="account-fullName" type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                  autoComplete="name"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-[#2aabb0] focus:outline-none transition-all" />
              </div>
            </div>
            <div>
              <label htmlFor="account-email" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">Email (read-only)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input id="account-email" type="email" value={user.email} disabled
                  autoComplete="email"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-base md:text-sm text-neutral-500 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label htmlFor="account-phone" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input id="account-phone" type="tel" inputMode="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  autoComplete="tel"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-[#2aabb0] focus:outline-none transition-all" />
              </div>
            </div>
          </div>

          <hr className="border-neutral-100" />

          <div>
            <h2 className="text-lg font-bold text-[#10164A] mb-1">Default Shipping Address</h2>
            <p className="text-xs text-neutral-500">This will be auto-filled during checkout.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="account-address" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <input id="account-address" type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                  autoComplete="street-address"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-[#2aabb0] focus:outline-none transition-all" />
              </div>
            </div>
            <div>
              <label htmlFor="account-city" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">City</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input id="account-city" type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                  autoComplete="address-level2"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-[#2aabb0] focus:outline-none transition-all" />
              </div>
            </div>
            <div>
              <label htmlFor="account-state" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">State</label>
              <div className="relative">
                <Map className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input id="account-state" type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                  autoComplete="address-level1"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-[#2aabb0] focus:outline-none transition-all" />
              </div>
            </div>
            <div>
              <label htmlFor="account-pincode" className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-1.5">PIN Code</label>
              <input id="account-pincode" type="text" inputMode="numeric" pattern="[0-9]*" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })}
                autoComplete="postal-code"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-[#2aabb0] focus:outline-none transition-all" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#10164A] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#1c246e] transition-all disabled:opacity-70 shadow-lg shadow-[#10164A]/20 active:scale-[0.98]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && (
              <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium animate-in fade-in">
                <CheckCircle className="w-4 h-4" /> Saved!
              </span>
            )}
          </div>
        </form>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-neutral-100">
            <h2 className="text-lg font-bold text-[#10164A]">Order History</h2>
            <p className="text-xs text-neutral-500 mt-1">View all your past orders placed on R Creation.</p>
          </div>

          {ordersLoading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#2aabb0]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
              <p className="text-neutral-500 text-sm font-medium">No orders yet</p>
              <p className="text-neutral-400 text-xs mt-1">Your order history will appear here after your first purchase.</p>
              <Link href="/products" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-[#10164A] text-white rounded-xl text-sm font-bold hover:bg-[#1c246e] transition-colors">
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {orders.map(order => (
                <div key={order.id} className="px-6 sm:px-8 py-5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-[#10164A] font-mono">{order.order_number}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-neutral-100 text-neutral-600'}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-bold font-mono text-[#10164A]">₹{Number(order.total).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
