'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/lib/types';

export default function AdminOrdersPage() {
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setOrders((data as Order[]) || []);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err?.message || 'Failed to load orders from Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Realtime listener for incoming orders
    const channel = supabase
      .channel('admin_orders_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          order_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus as any } : o))
      );
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateTracking = async (orderId: string, trackingNumber: string) => {
    try {
      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, tracking_number: trackingNumber } : o))
      );
    } catch (err: any) {
      alert('Failed to save tracking number: ' + err.message);
    }
  };

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((o) => o.order_status.toLowerCase() === filterStatus.toLowerCase());

  const totalRevenue = orders
    .filter((o) => o.payment_status?.toLowerCase() === 'paid')
    .reduce((acc, o) => acc + Number(o.total_amount), 0);

  const paidCount = orders.filter((o) => o.payment_status?.toLowerCase() === 'paid').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h2 className="font-serif text-[26px] text-[#2C241E] m-0 mb-1.5 font-semibold">Customer Orders & Payments</h2>
          <p className="text-sm text-[#7A6F66] m-0">
            Track online purchases, Razorpay transactions, shipping fulfilment, and courier dispatches.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors"
        >
          <span>↺ Refresh Orders</span>
        </button>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] text-[#D32F2F] border border-[#FECACA] rounded-lg p-3.5 px-4 mb-5 text-sm">
          {error}
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#E8E0D5] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <span className="text-[11px] text-[#7A6F66] uppercase tracking-[0.05em] font-semibold">
            Total Orders
          </span>
          <div className="text-2xl font-bold text-[#2C241E] mt-1">
            {orders.length}
          </div>
        </div>

        <div className="bg-white border border-[#E8E0D5] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <span className="text-[11px] text-[#7A6F66] uppercase tracking-[0.05em] font-semibold">
            Confirmed Paid Orders
          </span>
          <div className="text-2xl font-bold text-[#2E7D32] mt-1">
            {paidCount}
          </div>
        </div>

        <div className="bg-white border border-[#E8E0D5] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <span className="text-[11px] text-[#7A6F66] uppercase tracking-[0.05em] font-semibold">
            Online Revenue (Razorpay)
          </span>
          <div className="text-2xl font-bold text-[#7B5B3A] mt-1">
            {formatPrice(totalRevenue)}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`capitalize px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === st
                ? 'bg-[#7B5B3A] text-white font-semibold'
                : 'border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0]'
            }`}
          >
            {st} ({st === 'all' ? orders.length : orders.filter((o) => o.order_status === st).length})
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#E8E0D5] rounded-lg p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {loading ? (
          <div className="text-center py-10">
            <span className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
            <p className="mt-3 text-sm text-[#7A6F66]">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-[#7A6F66]">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-[15px] font-semibold text-[#2C241E]">
              No orders found matching this filter.
            </p>
            <p className="text-xs mt-1">
              When customers complete checkout via Razorpay or WhatsApp, their orders will show here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#E8E0D5] rounded-lg">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#FAF8F5]">
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Order #</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Customer & Delivery</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Items</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Amount</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Payment Status</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">Order Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const isPaid = order.payment_status?.toLowerCase() === 'paid';
                  const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={order.id} className="hover:bg-black/[0.01]">
                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <strong className="font-mono text-[#2C241E]">
                          {order.order_number}
                        </strong>
                        <div className="text-[11px] text-[#7A6F66]">
                          {dateStr}
                        </div>
                        {order.razorpay_payment_id && (
                          <div className="text-[10px] text-[#0E7064] font-mono mt-0.5">
                            RZP: {order.razorpay_payment_id}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <strong>{order.customer_name}</strong>
                        <div className="text-xs text-[#7A6F66]">
                          {order.customer_email}
                        </div>
                        {order.customer_phone && (
                          <div className="text-xs text-[#7A6F66]">
                            📞 {order.customer_phone}
                          </div>
                        )}
                        {order.shipping_address?.city && (
                          <div className="text-[11px] text-[#6B5744] mt-0.5">
                            📍 {order.shipping_address.city}, {order.shipping_address.state}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <div className="max-w-[240px]">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((it) => (
                              <div key={it.id} className="text-xs mb-1 flex items-center gap-1.5">
                                {it.image_url && (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={it.image_url} alt="" className="w-[22px] h-[26px] object-cover rounded-[3px]" />
                                )}
                                <span>
                                  <strong>{it.quantity}x</strong> {it.product_name} ({it.size || 'Std'})
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-[#7A6F66]">Order details</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <div className="font-bold text-sm">
                          {formatPrice(order.total_amount)}
                        </div>
                        {order.coupon_code && (
                          <div className="text-[11px] text-[#047857] font-semibold">
                            🏷️ {order.coupon_code} (-{formatPrice(order.discount_amount || 0)})
                          </div>
                        )}
                        <span className="text-[11px] text-[#7A6F66]">
                          via {order.payment_method}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded uppercase ${
                            isPaid ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#E65100]'
                          }`}
                        >
                          {isPaid ? 'Paid (Razorpay)' : 'Pending'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                        <div className="flex flex-col gap-1.5 min-w-[150px]">
                          <select
                            className="w-full text-xs px-2.5 py-1.5 border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] font-medium outline-none focus:border-[#7B5B3A] transition-colors"
                            value={order.order_status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          >
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing (Handcrafting)</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          {/* Tracking Number Input */}
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="Courier / AWB #"
                              defaultValue={order.tracking_number || ''}
                              className="w-full text-[11px] px-2 py-1 border border-[#E8E0D5] rounded bg-[#FAF8F5] text-[#2C241E] outline-none focus:bg-white focus:border-[#7B5B3A] transition-colors"
                              title="Press Enter or click away to save tracking number"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateTracking(order.id, (e.target as HTMLInputElement).value);
                                }
                              }}
                              onBlur={(e) => {
                                if (e.target.value !== (order.tracking_number || '')) {
                                  handleUpdateTracking(order.id, e.target.value);
                                }
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px]">
                            {order.tracking_number ? (
                              <span className="text-[#0E7064] font-medium">✓ Saved</span>
                            ) : (
                              <span className="text-[#8C7B6B]">No tracking</span>
                            )}
                            <a
                              href={`/track-order?orderNumber=${encodeURIComponent(order.order_number)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#7B5B3A] hover:underline font-medium"
                            >
                              View Live →
                            </a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
