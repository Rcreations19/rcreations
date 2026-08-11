'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { updateSiteSettings } from '@/lib/actions/settings';
import { createClient } from '@/lib/supabase/client';

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({
    contact_email: '',
    contact_phone: '',
    store_address: '',
    announcement_banner: '',
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        const newSettings = { ...settings };
        data.forEach(item => {
          if (newSettings[item.key] !== undefined) {
            newSettings[item.key] = (item.value as any)?.text || '';
          }
        });
        setSettings(newSettings);
      }
      setFetching(false);
    }
    loadSettings();
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

        <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden">
          <div className="p-6 space-y-6">
            
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[#111111] border-b border-[#eaeaea] pb-2 flex items-center gap-2">
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
              <h2 className="text-sm font-bold text-[#111111] border-b border-[#eaeaea] pb-2 flex items-center gap-2">
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
                      placeholder="sales@rcreation.in"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#595959]">Contact Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      name="contact_phone" 
                      defaultValue={settings.contact_phone}
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10164A] focus:outline-none transition-shadow"
                      placeholder="+91 98765 43210"
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
          
          <div className="px-6 py-4 bg-[#fcfcfc] border-t border-[#eaeaea] flex items-center justify-end gap-3">
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
    </div>
  );
}
