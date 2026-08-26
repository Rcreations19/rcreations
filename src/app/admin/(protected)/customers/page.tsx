import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Users, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { updateCustomerStatus } from '@/lib/actions/customers';

export const metadata = {
  title: 'B2B Customers | Admin Dashboard',
};

export default async function CustomersPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: customers } = await supabase
    .from('b2b_customers')
    .select('*')
    .order('created_at', { ascending: false });

  const handleStatusUpdate = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;
    await updateCustomerStatus(id, status);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">B2B Customers</h1>
          <p className="text-sm text-[#595959] mt-1">Review wholesale applications and manage pricing tiers.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Business</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">GSTIN</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Tier</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-[#595959] text-xs uppercase tracking-wider text-right">Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {customers && customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#888888]" />
                        <span className="font-semibold text-[#111111]">{customer.business_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[#111111]">{customer.contact_person}</span>
                        <span className="text-[10px] text-[#595959]">{customer.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#595959] font-mono text-xs">{customer.gstin || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase tracking-wider">
                        {customer.discount_tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        customer.status === 'approved' ? 'bg-green-100 text-green-700' : 
                        customer.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {customer.status === 'pending' ? (
                        <form action={handleStatusUpdate} className="flex items-center justify-end gap-2">
                          <input type="hidden" name="id" value={customer.id} />
                          <button 
                            name="status" 
                            value="rejected"
                            type="submit"
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Reject Application"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button 
                            name="status" 
                            value="approved"
                            type="submit"
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Approve Application"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </form>
                      ) : (
                        <span className="text-[10px] text-[#888888] font-mono">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#595959]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-[#888888] mb-2" />
                      <p className="font-medium">No B2B customers found</p>
                      <p className="text-xs">Wholesale applications will appear here.</p>
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
