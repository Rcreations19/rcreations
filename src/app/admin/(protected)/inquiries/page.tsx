import React from 'react';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Mail, ArrowRight, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const metadata = {
  title: 'Inquiries | Admin Dashboard',
};

export default async function InquiriesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">Inquiries</h1>
          <p className="text-sm text-[#595959] mt-1">Manage wholesale, retail, and general contact requests.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#fcfcfc] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Received</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {inquiries && inquiries.length > 0 ? (
                inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-[#fcfcfc] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#111111]">{inq.name}</span>
                        <span className="text-xs text-[#595959] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {inq.email}
                        </span>
                        {inq.company && <span className="text-[10px] text-[#888888] font-mono mt-1">🏢 {inq.company}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
                        {inq.inquiry_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        inq.status === 'new' ? 'bg-blue-100 text-blue-700 animate-pulse' : 
                        inq.status === 'responded' ? 'bg-amber-100 text-amber-700' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {inq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#595959] text-xs">
                      {formatDistanceToNow(new Date(inq.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/inquiries/${inq.id}`} 
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#111111] bg-white border border-[#eaeaea] rounded-lg hover:bg-[#f5f5f5] transition-colors"
                      >
                        Review <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#595959]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MessageSquare className="w-8 h-8 text-[#888888] mb-2" />
                      <p className="font-medium">Inbox zero!</p>
                      <p className="text-xs">No pending inquiries at the moment.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
