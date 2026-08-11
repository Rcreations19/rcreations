import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ArrowLeft, Mail, Phone, Building2, Calendar, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { updateInquiryStatus } from '@/lib/actions/inquiries';

export const metadata = {
  title: 'Inquiry Details | Admin Dashboard',
};

export default async function InquiryDetailsPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!inquiry) {
    notFound();
  }

  // Server action wrapper for the form
  const handleStatusUpdate = async (formData: FormData) => {
    'use server';
    const status = formData.get('status') as string;
    await updateInquiryStatus(params.id, status);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/inquiries" className="p-2 bg-white border border-[#eaeaea] rounded-lg text-[#595959] hover:text-[#111111] hover:bg-[#fcfcfc] transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">Inquiry Details</h1>
            <p className="text-sm text-[#595959] mt-1">Review and manage this contact request.</p>
          </div>
        </div>
        
        <form action={handleStatusUpdate} className="flex gap-2">
          {inquiry.status !== 'closed' && (
            <button 
              name="status" 
              value="closed"
              type="submit"
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-sm font-bold transition-colors"
            >
              Close Inquiry
            </button>
          )}
          {inquiry.status === 'new' && (
            <button 
              name="status" 
              value="responded"
              type="submit"
              className="px-4 py-2 bg-[#10164A] hover:bg-[#1c246e] text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Mark as Responded
            </button>
          )}
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#eaeaea] bg-[#fcfcfc]">
              <h2 className="text-sm font-bold text-[#111111]">Contact Information</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">Name</p>
                <p className="text-sm font-semibold text-[#111111]">{inquiry.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">Email</p>
                <a href={`mailto:${inquiry.email}`} className="text-sm font-medium text-[#0070f3] hover:underline flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {inquiry.email}
                </a>
              </div>
              {inquiry.phone && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">Phone</p>
                  <a href={`tel:${inquiry.phone}`} className="text-sm font-medium text-[#111111] flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#595959]" /> {inquiry.phone}
                  </a>
                </div>
              )}
              {inquiry.company && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">Company</p>
                  <p className="text-sm font-medium text-[#111111] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#595959]" /> {inquiry.company}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#eaeaea] bg-[#fcfcfc]">
              <h2 className="text-sm font-bold text-[#111111]">Metadata</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">Received On</p>
                <p className="text-sm font-medium text-[#111111] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#595959]" /> 
                  {format(new Date(inquiry.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">Current Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${
                  inquiry.status === 'new' ? 'bg-blue-100 text-blue-700' : 
                  inquiry.status === 'responded' ? 'bg-amber-100 text-amber-700' :
                  'bg-neutral-100 text-neutral-600'
                }`}>
                  {inquiry.status}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">Inquiry Type</p>
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider mt-1">
                  {inquiry.inquiry_type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden h-full">
            <div className="px-6 py-5 border-b border-[#eaeaea] bg-[#fcfcfc] flex items-center gap-2 text-[#595959]">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Message Content</span>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none text-[#111111] whitespace-pre-wrap">
                {inquiry.message}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
