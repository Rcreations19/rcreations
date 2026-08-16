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
    <div className="min-h-screen bg-neutral-50/50 pt-8 md:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="max-w-3xl mx-auto mb-16 text-center space-y-4">
          <div className="inline-flex items-center justify-center space-x-2 bg-[#2aabb0]/10 px-4 py-1.5 rounded-full border border-[#2aabb0]/20">
            <span className="w-2 h-2 rounded-full bg-[#2aabb0] animate-pulse"></span>
            <span className="text-sm font-semibold text-[#2aabb0] tracking-wide uppercase">Get In Touch</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-secondary tracking-tight">
            Let&apos;s build something <span className="text-[#2aabb0]">beautiful.</span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Whether you need bulk wholesale frames, custom trophies for an event, or have a general inquiry, our team is ready to assist you with factory-direct pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-neutral-100 shadow-xl shadow-neutral-200/40 relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-[#2aabb0]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            {submitted ? (
              <div className="text-center py-20 space-y-6 relative z-10">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-secondary">Inquiry Received!</h2>
                  <p className="text-neutral-500 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. Our team is reviewing your requirements and will get back to you shortly.
                  </p>
                </div>
                <button onClick={() => setSubmitted(false)} className="text-sm font-medium text-[#2aabb0] hover:text-secondary transition-colors underline-offset-4 hover:underline mt-4">
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="flex items-center gap-3 pb-6 border-b border-neutral-100">
                  <div className="p-2.5 bg-secondary/5 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-secondary" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary">Send Us an Inquiry</h2>
                </div>

                {/* Inquiry Type */}
                <div className="space-y-3">
                  <span className="text-sm font-semibold text-neutral-900">What can we help you with?</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'wholesale', label: 'Wholesale / B2B' },
                      { id: 'retail', label: 'Retail Order' },
                      { id: 'custom', label: 'Custom Order' },
                      { id: 'general', label: 'General Info' },
                    ].map((t) => (
                      <button key={t.id} type="button" onClick={() => setForm({ ...form, type: t.id })}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2aabb0] focus-visible:ring-offset-2 ${
                          form.type === t.id 
                            ? 'bg-secondary border-secondary text-white shadow-md shadow-secondary/20 scale-[1.02]' 
                            : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-sm font-semibold text-neutral-900">Full Name <span className="text-red-500">*</span></label>
                    <input id="contact-name" type="text" required placeholder="e.g. Ramesh Kumar" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-base md:text-sm placeholder:text-neutral-400 focus:bg-white focus:border-[#2aabb0] focus:ring-4 focus:ring-[#2aabb0]/10 transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-phone" className="block text-sm font-bold text-[#0a0e27] mb-2 uppercase tracking-wide">Phone Number</label>
                    <input id="contact-phone" type="tel" inputMode="tel" required placeholder="+91 87549 40610" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-base md:text-sm placeholder:text-neutral-400 focus:bg-white focus:border-[#2aabb0] focus:ring-4 focus:ring-[#2aabb0]/10 transition-all outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="block text-sm font-bold text-[#0a0e27] mb-2 uppercase tracking-wide">Email Address</label>
                    <input id="contact-email" type="email" required placeholder="rcreationsstudio@gmail.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-base md:text-sm placeholder:text-neutral-400 focus:bg-white focus:border-[#2aabb0] focus:ring-4 focus:ring-[#2aabb0]/10 transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-company" className="text-sm font-semibold text-neutral-900">Company / Studio <span className="text-neutral-400 font-normal">(Optional)</span></label>
                    <input id="contact-company" type="text" placeholder="Your business name" value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-4 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-base md:text-sm placeholder:text-neutral-400 focus:bg-white focus:border-[#2aabb0] focus:ring-4 focus:ring-[#2aabb0]/10 transition-all outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-sm font-semibold text-neutral-900">Message / Requirements <span className="text-red-500">*</span></label>
                  <textarea id="contact-message" rows={5} required placeholder="Describe your order requirements, quantities, customization needs..."
                    value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-base md:text-sm placeholder:text-neutral-400 focus:bg-white focus:border-[#2aabb0] focus:ring-4 focus:ring-[#2aabb0]/10 transition-all outline-none resize-none" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#10164A] to-[#1a237e] text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-secondary/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin text-white/80" /> : <Send className="w-5 h-5 text-[#2aabb0] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  <span>{loading ? 'Sending Inquiry...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Contact Info Sidebar */}
          <div className="lg:col-span-5 space-y-8">
            {/* Main Contact Card */}
            <div className="relative bg-secondary p-8 sm:p-10 rounded-3xl text-white overflow-hidden shadow-2xl shadow-secondary/20">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#2aabb0] rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
              
              <div className="relative z-10 space-y-10">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Factory Contact</h3>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    Direct access to our manufacturing unit. Reach out for bulk pricing and custom designs.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-[#2aabb0]/20 group-hover:border-[#2aabb0]/30 transition-colors">
                      <MapPin className="w-5 h-5 text-[#2aabb0]" />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block mb-1">Factory Address</span>
                      <span className="text-white text-sm leading-relaxed block">R Creation, Gudiyattam,<br/>Vellore District, Tamil Nadu — 632602</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-[#2aabb0]/20 group-hover:border-[#2aabb0]/30 transition-colors">
                      <Phone className="w-5 h-5 text-[#2aabb0]" />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block mb-1">Phone / WhatsApp</span>
                      <span className="text-white text-lg font-medium block">+91 87549 40610</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-[#2aabb0]/20 group-hover:border-[#2aabb0]/30 transition-colors">
                      <Mail className="w-5 h-5 text-[#2aabb0]" />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block mb-1">Email Address</span>
                      <span className="text-white text-sm block">rcreationsstudio@gmail.com</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-[#2aabb0]/20 group-hover:border-[#2aabb0]/30 transition-colors">
                      <Building2 className="w-5 h-5 text-[#2aabb0]" />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block mb-1">Business Hours</span>
                      <span className="text-white text-sm block">Mon - Sat: 9:00 AM - 8:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Response Promise */}
            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-xl shadow-neutral-200/20">
              <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#2aabb0]"></div>
                Quick Response Promise
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Wholesale inquiries responded within <strong className="text-neutral-900">4 hours</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Custom order quotations within <strong className="text-neutral-900">24 hours</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    GST proforma invoice on request
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
