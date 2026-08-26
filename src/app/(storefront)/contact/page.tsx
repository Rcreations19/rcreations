'use client';

import React, { useState, useCallback } from 'react';
import { MapPin, Phone, Mail, Building2, Send, Check, Loader2 } from 'lucide-react';
import { submitInquiry } from '@/lib/actions/inquiries';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type FormErrors = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

function validateField(name: string, value: string): string | undefined {
  switch (name) {
    case 'name':
      if (!value.trim()) return 'Full name is required';
      if (value.trim().length < 2) return 'Name must be at least 2 characters';
      return undefined;
    case 'email':
      if (!value.trim()) return 'Email address is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
      return undefined;
    case 'phone':
      if (!value.trim()) return 'Phone number is required';
      if (!/^[+]?[\d\s-]{7,15}$/.test(value.replace(/\s/g, ''))) return 'Please enter a valid phone number';
      return undefined;
    case 'message':
      if (!value.trim()) return 'Message is required';
      if (value.trim().length < 10) return 'Message must be at least 10 characters';
      return undefined;
    default:
      return undefined;
  }
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '', type: 'general' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  }, [touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldErrors: FormErrors = {
      name: validateField('name', form.name),
      email: validateField('email', form.email),
      phone: validateField('phone', form.phone),
      message: validateField('message', form.message),
    };
    setErrors(fieldErrors);
    setTouched({ name: true, email: true, phone: true, message: true });

    if (Object.values(fieldErrors).some(Boolean)) return;

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));

      const result = await submitInquiry(formData);

      if (result.success) {
        setSubmitted(true);
        toast.success('Inquiry submitted successfully');
      } else {
        toast.error(result.error?.message || 'Failed to submit inquiry');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (hasError: boolean) =>
    `w-full px-5 py-4 bg-neutral-100 rounded-2xl text-base md:text-sm font-medium placeholder:text-neutral-400 focus:bg-white focus:ring-4 transition-all outline-none border ${
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
        : 'border-transparent focus:border-accent/40 focus:ring-accent/15'
    }`;

  return (
    <div className="min-h-screen bg-neutral-50 pt-32 md:pt-28 pb-24 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="max-w-4xl mx-auto mb-16 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-900 mb-6">
            Let's build something <span className="text-accent">beautiful.</span>
          </h1>
          <p className="text-lg font-medium text-neutral-500 max-w-2xl mx-auto mt-4">
            Whether you need bulk wholesale frames, custom trophies for an event, or have a general inquiry, our team is ready to assist you with factory-direct pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-20 space-y-6 relative z-10"
              >
                <div className="w-20 h-20 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Inquiry Received</h2>
                  <p className="text-neutral-500 font-medium max-w-md mx-auto">
                    Thank you for reaching out. Our team is reviewing your requirements and will get back to you shortly.
                  </p>
                </div>
                <button type="button" onClick={() => setSubmitted(false)} className="cursor-pointer text-sm font-medium text-neutral-900 hover:text-accent transition-colors underline-offset-4 hover:underline mt-4">
                  Send another inquiry
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit} noValidate className="space-y-8 relative z-10"
              >
                <div className="pb-6 border-b border-neutral-100">
                  <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Send Us an Inquiry</h2>
                </div>

                {/* Inquiry Type */}
                <div className="space-y-4">
                  <span className="text-sm font-semibold tracking-tight text-neutral-500">What can we help you with?</span>
                  <div className="flex flex-wrap gap-1 p-1.5 bg-neutral-100/70 rounded-2xl">
                    {[
                      { id: 'wholesale', label: 'Wholesale / B2B' },
                      { id: 'retail', label: 'Retail Order' },
                      { id: 'custom', label: 'Custom Order' },
                      { id: 'general', label: 'General Info' },
                    ].map((t) => (
                      <button key={t.id} type="button" onClick={() => setForm({ ...form, type: t.id })}
                        className={`relative cursor-pointer px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 flex-1 min-w-[120px] ${
                          form.type === t.id
                            ? 'text-neutral-900'
                            : 'text-neutral-500 hover:text-neutral-700'
                        }`}>
                        {form.type === t.id && (
                          <motion.div layoutId="contact-type-pill" className="absolute inset-0 bg-white shadow-sm rounded-xl" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                        )}
                        <span className="relative z-10">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Name + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-xs font-semibold tracking-tight text-neutral-500 block">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={form.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className={inputClasses(!!errors.name)}
                    />
                    {errors.name && touched.name && (
                      <p id="name-error" role="alert" className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-phone" className="text-xs font-semibold tracking-tight text-neutral-500 block">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      required
                      placeholder="+91 87549 40610"
                      value={form.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      className={inputClasses(!!errors.phone)}
                    />
                    {errors.phone && touched.phone && (
                      <p id="phone-error" role="alert" className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Email + Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-xs font-semibold tracking-tight text-neutral-500 block">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      placeholder="rcreationsstudio@gmail.com"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className={inputClasses(!!errors.email)}
                    />
                    {errors.email && touched.email && (
                      <p id="email-error" role="alert" className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-company" className="text-xs font-semibold tracking-tight text-neutral-500 block">
                      Company / Studio <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="contact-company"
                      name="company"
                      type="text"
                      placeholder="Your business name"
                      value={form.company}
                      onChange={handleChange}
                      className={inputClasses(false)}
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-xs font-semibold tracking-tight text-neutral-500 block">
                    Message / Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Describe your order requirements, quantities, customization needs..."
                    value={form.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    className={`${inputClasses(!!errors.message)} resize-none`}
                  />
                  {errors.message && touched.message && (
                    <p id="message-error" role="alert" className="text-xs text-red-500 mt-1 font-medium">{errors.message}</p>
                  )}
                </div>

                <button type="submit" disabled={loading}
                  className="cursor-pointer w-full py-4 bg-accent hover:brightness-105 active:scale-[0.98] text-primary rounded-full text-sm font-semibold tracking-tight transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin text-primary/80" /> : <Send className="w-5 h-5 text-primary" />}
                  <span>{loading ? 'Sending Inquiry...' : 'Submit Inquiry'}</span>
                </button>
              </motion.form>
            )}
            </AnimatePresence>
          </div>

          {/* Contact Info Sidebar */}
          <div className="lg:col-span-5 space-y-8">
            {/* Main Contact Card */}
            <div className="bg-white border border-accent/10 p-8 sm:p-10 rounded-[2rem] text-neutral-900 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
              <div className="relative z-10 space-y-10">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight mb-3">Factory Contact</h3>
                  <p className="text-neutral-500 font-medium text-sm leading-relaxed max-w-sm">
                    Direct access to our manufacturing unit. Reach out for bulk pricing and custom designs.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold tracking-tight text-neutral-500 block mb-1">Factory Address</span>
                      <span className="text-neutral-900 text-sm font-medium leading-relaxed block">R Creation, Gudiyattam,<br/>Vellore District, Tamil Nadu - 632602</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold tracking-tight text-neutral-500 block mb-1">Phone / WhatsApp</span>
                      <span className="text-neutral-900 text-lg font-semibold tracking-tight block">+91 87549 40610</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold tracking-tight text-neutral-500 block mb-1">Email Address</span>
                      <span className="text-neutral-900 text-sm font-medium block">rcreationsstudio@gmail.com</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold tracking-tight text-neutral-500 block mb-1">Business Hours</span>
                      <span className="text-neutral-900 text-sm font-medium block">Mon - Sat: 9:00 AM - 8:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Response Promise */}
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-base font-semibold tracking-tight text-neutral-900 mb-6 flex items-center gap-2">
                Quick Response Promise
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-neutral-900" />
                  </div>
                  <p className="text-sm font-medium text-neutral-500 leading-relaxed">
                    Wholesale inquiries responded within <strong className="text-neutral-900">4 hours</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-neutral-900" />
                  </div>
                  <p className="text-sm font-medium text-neutral-500 leading-relaxed">
                    Custom order quotations within <strong className="text-neutral-900">24 hours</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-neutral-900" />
                  </div>
                  <p className="text-sm font-medium text-neutral-500 leading-relaxed">
                    GST proforma invoice on request
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Google Map Section */}
        <div className="mt-12 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-6xl mx-auto overflow-hidden">
          <div className="flex items-center gap-3 p-6 sm:p-10 pb-6 sm:pb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Visit Our Factory</h2>
            <p className="text-sm font-medium text-neutral-500 ml-4 hidden sm:block">R Creation Frames, Gandhi Rd, Gudiyattam</p>
          </div>
          <div style={{ position: 'relative', paddingBottom: '40%', height: 0, width: '100%' }}>
            <iframe
              src="https://maps.google.com/maps?q=rcreation%2Cgudiyattam&t=m&z=15&ie=UTF8&iwloc=B&output=embed"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="R Creation Frames factory location in Gudiyattam"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
