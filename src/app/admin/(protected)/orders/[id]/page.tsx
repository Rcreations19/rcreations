import React from 'react';
import Link from 'next/link';
import { getOrderById, updateOrderStatus } from '@/lib/actions/admin-orders';
import { ArrowLeft, User, MapPin, CreditCard, Package, Truck, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { DownloadPhotoButton } from '@/components/admin/DownloadPhotoButton';

export default async function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const order = await getOrderById(params.id);

  if (!order) {
    return <div>Order not found</div>;
  }

  // Define action for the form
  const handleStatusUpdate = async (formData: FormData) => {
    'use server';
    const newStatus = formData.get('status') as string;
    await updateOrderStatus(params.id, newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/orders" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#111111] font-mono">{order.order_number}</h1>
          <p className="text-sm text-[#595959] mt-1">Placed on {format(new Date(order.created_at), 'MMMM d, yyyy h:mm a')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-surface flex items-center gap-2">
              <Package className="w-5 h-5 text-[#595959]" />
              <h2 className="font-bold text-[#111111]">Order Items</h2>
            </div>
            
            <div className="divide-y divide-[#eaeaea]">
              {order.items.map((item: any) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {item.custom_config?.signedPhotoUrl ? (
                      <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-border relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={item.custom_config.signedPhotoUrl} 
                          alt="Customer upload" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0 border border-border">
                        <Package className="w-6 h-6 text-neutral-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-[#111111]">{item.title}</h3>
                      <p className="text-xs text-[#595959] mt-1 font-mono">ID: {item.product_id || 'CUSTOM'}</p>
                      
                      {/* Render custom configuration details */}
                      {item.custom_config && (
                        <div className="mt-2 space-y-1">
                          {item.custom_config.width && item.custom_config.height && (
                            <p className="text-xs text-neutral-600"><span className="font-bold">Size:</span> {item.custom_config.width}" × {item.custom_config.height}"</p>
                          )}
                          {item.custom_config.material && (
                            <p className="text-xs text-neutral-600"><span className="font-bold">Material:</span> {item.custom_config.material}</p>
                          )}
                          {item.custom_config.mount && (
                            <p className="text-xs text-neutral-600"><span className="font-bold">Mount:</span> {item.custom_config.mount}</p>
                          )}
                          {item.custom_config.glass && (
                            <p className="text-xs text-neutral-600"><span className="font-bold">Glass:</span> {item.custom_config.glass}</p>
                          )}
                          {item.custom_config.signedPhotoUrl && (
                            <div className="pt-2">
                              <DownloadPhotoButton
                                signedUrl={item.custom_config.signedPhotoUrl}
                                filename={`order-${order.order_number}-photo.jpg`}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {item.details && !item.custom_config && (
                        <p className="text-xs text-neutral-500 mt-1">{item.details}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#111111] font-mono">₹{item.price}</p>
                    <p className="text-xs text-[#595959] mt-1">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-surface border-t border-border">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#595959]">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-[#595959]">
                  <span>GST (18%)</span>
                  <span className="font-mono">₹{order.tax_amount}</span>
                </div>
                <div className="flex justify-between text-[#595959]">
                  <span>Shipping</span>
                  <span className="font-mono">{order.shipping_cost === 0 ? 'FREE' : `₹${order.shipping_cost}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#111111] pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="font-mono">₹{order.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Status & Customer Details */}
        <div className="space-y-6">
          
          {/* Status Update Card */}
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden p-5">
            <h2 className="font-bold text-[#111111] mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#595959]" /> Fulfillment Status
            </h2>
            <form action={handleStatusUpdate} className="space-y-4">
              <div>
                <select 
                  name="status" 
                  defaultValue={order.status}
                  className="w-full p-2.5 bg-surface border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0070f3] outline-none"
                >
                  <option value="pending">🟡 Pending (Payment / Verification)</option>
                  <option value="processing">🔵 Processing (Manufacturing)</option>
                  <option value="shipped">🟣 Shipped (In Transit)</option>
                  <option value="delivered">🟢 Delivered (Complete)</option>
                  <option value="cancelled">🔴 Cancelled</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#0070f3] text-white text-sm font-bold rounded-lg hover:bg-[#0051a8] transition-colors">
                Update Status
              </button>
            </form>
          </div>

          {/* Customer Details */}
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden p-5">
            <h2 className="font-bold text-[#111111] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#595959]" /> Customer Details
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold text-[#595959] uppercase tracking-wider mb-1">Contact</p>
                <p className="font-medium text-[#111111]">{order.customer_name}</p>
                <p className="text-[#595959]">{order.email}</p>
                <p className="text-[#595959]">{order.phone}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#595959] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Shipping Address
                </p>
                <p className="text-[#111111] leading-relaxed">
                  {order.address}<br />
                  {order.city}, {order.state} {order.pincode}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#595959] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> Payment Method
                </p>
                <p className="text-[#111111]">Cash on Delivery (COD)</p>
                <p className="text-xs text-[#595959] mt-0.5">Integration pending</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
