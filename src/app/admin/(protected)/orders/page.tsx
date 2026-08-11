import React from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/actions/admin-orders';
import { Search, ExternalLink, Calendar, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Orders</h1>
          <p className="text-sm text-[#595959] mt-1">Manage all incoming guest and retail orders.</p>
        </div>
      </div>

      <div className="bg-white border border-[#eaeaea] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#eaeaea] flex items-center justify-between bg-[#fcfcfc]">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-[#595959] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#eaeaea] rounded-md text-sm focus:ring-1 focus:ring-[#0070f3] focus:border-[#0070f3] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left admin-table-striped">
            <thead className="text-xs text-[#595959] uppercase bg-[#f5f5f5] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Order ID</th>
                <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                <th className="px-6 py-4 font-bold tracking-wider">Customer</th>
                <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Total</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {orders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#595959]">
                    <div className="flex flex-col items-center justify-center">
                      <ShoppingCart className="w-10 h-10 text-[#eaeaea] mb-3" />
                      <p>No orders found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-[#111111]">
                      {order.order_number}
                      {order.is_guest && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-600 font-sans font-bold">GUEST</span>}
                    </td>
                    <td className="px-6 py-4 text-[#595959]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#111111]">{order.customer_name}</div>
                      <div className="text-xs text-[#595959]">{order.city}, {order.state}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-[#111111]">
                      ₹{order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0070f3] hover:text-[#0051a8]"
                      >
                        View <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


