import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { ShoppingCart, Mail, Phone, Clock, AlertCircle } from 'lucide-react';

export const metadata = { title: 'Abandoned Carts | Admin' };

export default async function AbandonedCartsPage() {
  const supabase = (await createClient()) as any;
  
  const { data: carts, error } = await supabase
    .from('abandoned_carts')
    .select('*')
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching abandoned carts:', error);
  }

  const formatCurrency = (val: number) => `₹${val.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Abandoned Carts</h1>
          <p className="text-sm text-[#86868b] mt-1">
            Potential customers who left items in their cart.
          </p>
        </div>
      </div>

      {!carts || carts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e5ea] p-12 text-center">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-6 h-6 text-[#86868b]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">No Active Abandoned Carts</h3>
          <p className="text-[#86868b] text-sm">When customers leave items in their cart and enter contact info, they'll appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(carts as any[]).map((cart: any) => {
            const items = cart.items as any[];
            const cartTotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
            
            return (
              <div key={cart.id} className="bg-white rounded-2xl border border-[#e5e5ea] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md uppercase tracking-wider">
                      Recoverable
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[#1d1d1f]">{formatCurrency(cartTotal)}</span>
                </div>
                
                <div className="space-y-3 mb-5">
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-[#86868b] mt-0.5 shrink-0" />
                    <span className="text-sm text-[#1d1d1f] break-all">{cart.email || <span className="text-[#86868b] italic">No email provided</span>}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-[#86868b] mt-0.5 shrink-0" />
                    <span className="text-sm text-[#1d1d1f]">{cart.phone || <span className="text-[#86868b] italic">No phone provided</span>}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#86868b] mt-0.5 shrink-0" />
                    <span className="text-sm text-[#1d1d1f]">Last active: {new Date(cart.updated_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-[#e5e5ea] pt-4">
                  <h4 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">Cart Contents ({items.length} items)</h4>
                  <ul className="space-y-2 max-h-32 overflow-y-auto pr-2">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-[#1d1d1f] truncate pr-4">{item.quantity}x {item.title || 'Product'}</span>
                        <span className="text-[#86868b] tabular-nums">{formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 flex gap-2">
                  {cart.email && (
                    <a href={`mailto:${cart.email}`} className="flex-1 text-center bg-[#0071e3] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#0077ED] transition-colors">
                      Email
                    </a>
                  )}
                  {cart.phone && (
                    <a href={`tel:${cart.phone}`} className="flex-1 text-center bg-white border border-[#0071e3] text-[#0071e3] py-2 rounded-lg text-sm font-medium hover:bg-[#f5f5f7] transition-colors">
                      Call
                    </a>
                  )}
                  {!cart.email && !cart.phone && (
                    <div className="w-full text-center py-2 bg-neutral-50 text-[#86868b] rounded-lg text-sm flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Anonymous Cart
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
