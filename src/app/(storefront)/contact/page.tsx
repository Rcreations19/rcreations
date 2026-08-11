'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Building2, Send, Check, MessageSquare, Loader2 } from 'lucide-react';
import { submitInquiry } from '@/lib/actions/inquiries';
import { useToast } from '@/components/shared/ToastContext';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '', type: 'general' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      
      const result = await submitInquiry(formData);
      
      if (result.success) {
        setSubmitted(true);
        showToast('Inquiry submitted successfully', 'success');
      } else {
        showToast(result.error?.message || 'Failed to submit inquiry', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mb-12 text-center space-y-2">
        <span className="text-xs font-mono font-bold uppercase text-[#2aabb0] bg-[#10164A] px-2.5 py-1 rounded inline-block">
          Get In Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10164A] tracking-tight">
          Contact R Creation
        </h1>
        <p className="text-sm text-neutral-600">
          Send us your wholesale inquiry, custom order requirements, or any questions about our products and manufacturing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-2xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-[#10164A]">Inquiry Submitted Successfully</h2>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                Our team will review your inquiry and respond within 24 hours. For urgent wholesale orders, call us directly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-lg font-extrabold text-[#10164A] flex items-center gap-2 pb-4 border-b border-neutral-200">
                <MessageSquare className="w-5 h-5 text-[#2aabb0]" />
                <span>Send Us an Inquiry</span>
              </h2>

              {/* Inquiry Type */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#10164A] block mb-2">Inquiry Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'wholesale', label: 'Wholesale / B2B' },
                    { id: 'retail', label: 'Retail Order' },
                    { id: 'custom', label: 'Custom Order' },
                    { id: 'general', label: 'General' },
                  ].map((t) => (
                    <button key={t.id} type="button" onClick={() => setForm({ ...form, type: t.id })}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        form.type === t.id ? 'bg-[#10164A] text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#10164A] block mb-1">Full Name *</label>
                  <input type="text" required placeholder="e.g. Ramesh Kumar" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-[#10164A] focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#10164A] block mb-1">Mobile Number *</label>
                  <input type="tel" required placeholder="+91 98765 43210" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-[#10164A] focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#10164A] block mb-1">Email Address *</label>
                  <input type="email" required placeholder="business@email.com" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-[#10164A] focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#10164A] block mb-1">Company / Studio Name</label>
                  <input type="text" placeholder="Optional" value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-[#10164A] focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#10164A] block mb-1">Message / Requirements *</label>
                <textarea rows={4} required placeholder="Describe your order requirements, quantities, customization needs..."
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-[#10164A] focus:outline-none resize-none" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-[#10164A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1c246e] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#2aabb0]" /> : <Send className="w-4 h-4 text-[#2aabb0]" />}
                <span>{loading ? 'Submitting...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#10164A] p-6 rounded-2xl text-white space-y-4">
            <h3 className="text-lg font-extrabold text-[#2aabb0]">Factory Contact Details</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#2aabb0] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Factory Address</span>
                  <span className="text-neutral-300">R Creation, Gudiyattam, Vellore District, Tamil Nadu — 632602</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#2aabb0] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Phone / WhatsApp</span>
                  <span className="text-neutral-300 font-mono">+91 98765 43210</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#2aabb0] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Email</span>
                  <span className="text-neutral-300 font-mono">contact@rcreation.in</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-[#2aabb0] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Business Hours</span>
                  <span className="text-neutral-300">Monday - Saturday: 9:00 AM - 8:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-3">
            <h3 className="text-sm font-bold text-[#10164A] uppercase tracking-wider">Quick Response Promise</h3>
            <div className="space-y-2 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Wholesale inquiries responded within <strong>4 hours</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Custom order quotations within <strong>24 hours</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>GST proforma invoice on request</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
