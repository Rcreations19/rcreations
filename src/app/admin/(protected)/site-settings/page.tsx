'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Globe, Mail, Phone, MapPin, ShoppingBag, FileSpreadsheet, Upload } from 'lucide-react';
import { updateSiteSettings } from '@/lib/actions/settings';
import { uploadPricingData } from '@/lib/actions/pricing';
import { createClient } from '@/lib/supabase/client';

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pricingSuccess, setPricingSuccess] = useState(false);

  const [settings, setSettings] = useState<Record<string, string>>({
    contact_email: '',
    contact_phone: '',
    store_address: '',
    announcement_banner: '',
    delivery_charge: '500',
    free_shipping_threshold: '10000',
    gift_packing_charge: '250',
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        const newSettings = { ...settings };
        data.forEach(item => {
          if (newSettings[item.key] !== undefined) {
            newSettings[item.key] = (item.value as Record<string, string>)?.text || '';
          }
        });
        setSettings(newSettings);
      }
      setFetching(false);
    }
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateSiteSettings(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handlePricingUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPricingLoading(true);
    setPricingError(null);
    setPricingSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await uploadPricingData(formData);

    if (result?.error) {
      setPricingError(result.error);
    } else {
      setPricingSuccess(true);
      (e.target as HTMLFormElement).reset();
    }
    setPricingLoading(false);
  };

  if (fetching) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#888888]" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">Site Settings</h1>
          <p className="text-sm text-[#595959] mt-1">Manage global variables and contact information.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl">
            Settings updated successfully!
          </div>
        )}

        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 space-y-6">
            
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[#111111] border-b border-border pb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#595959]" /> Global Storefront
              </h2>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Announcement Banner Text</label>
                <input 
                  type="text" 
                  name="announcement_banner" 
                  defaultValue={settings.announcement_banner}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                  placeholder="e.g. Free shipping on wholesale orders over ₹10,000!"
                />
                <p className="text-[10px] text-[#888888]">Leave blank to hide the top bar banner.</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-sm font-bold text-[#111111] border-b border-border pb-2 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#595959]" /> Cart & Pricing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Base Delivery Charge (₹)</label>
                  <input 
                    type="number" 
                    name="delivery_charge" 
                    defaultValue={settings.delivery_charge}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Free Shipping Threshold (₹)</label>
                  <input 
                    type="number" 
                    name="free_shipping_threshold" 
                    defaultValue={settings.free_shipping_threshold}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Gift Box Charge (₹)</label>
                  <input 
                    type="number" 
                    name="gift_packing_charge" 
                    defaultValue={settings.gift_packing_charge}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-sm font-bold text-[#111111] border-b border-border pb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#595959]" /> Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Contact Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      name="contact_email" 
                      defaultValue={settings.contact_email}
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                      placeholder="rcreationsstudio@gmail.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Contact Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="tel" 
                      name="contact_phone" 
                      defaultValue={settings.contact_phone}
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                      placeholder="+91 87549 40610"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Store Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <textarea 
                    name="store_address" 
                    rows={3}
                    defaultValue={settings.store_address}
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow resize-none"
                    placeholder="123 Wholesale Market..."
                  />
                </div>
              </div>
            </div>

          </div>
          
          <div className="px-6 py-4 bg-surface border-t border-border flex items-center justify-end gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#10164A] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1c246e] transition-colors shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>

      {/* Pricing Upload Section */}
      <form onSubmit={handlePricingUpload} className="space-y-6">
        {pricingError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl">
            {pricingError}
          </div>
        )}
        {pricingSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl">
            Pricing data updated successfully! The configurator will now use these new prices.
          </div>
        )}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#111111] border-b border-border pb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#595959]" /> Rate Card Upload
            </h2>
            <p className="text-sm text-[#595959]">
              Upload the <strong>R_Creation_Rate_Card.xlsx</strong> file to update all prices across the storefront configurator.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="file"
                name="file"
                accept=".xlsx"
                required
                className="block w-full text-sm text-neutral-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#10164A] file:text-white
                  hover:file:bg-[#1c246e] transition-colors cursor-pointer"
              />
              <button 
                type="submit" 
                disabled={pricingLoading}
                className="bg-[#10164A] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#1c246e] transition-colors shadow-sm disabled:opacity-70 whitespace-nowrap"
              >
                {pricingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {pricingLoading ? 'Uploading...' : 'Upload Data'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
