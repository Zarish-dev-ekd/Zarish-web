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
  }, []);

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
    .filter((o) => o.payment_status === 'paid')
    .reduce((acc, o) => acc + Number(o.total_amount), 0);

  const paidCount = orders.filter((o) => o.payment_status === 'paid').length;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Customer Orders & Payments</h2>
          <p className="admin-page-subtitle">
            Track online purchases, Razorpay transactions, shipping fulfilment, and courier dispatches.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="admin-btn admin-btn--secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <span>↺ Refresh Orders</span>
        </button>
      </div>

      {error && (
        <div className="admin-card" style={{ background: '#FFEBEE', color: '#D32F2F', padding: '12px 16px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ padding: '18px 20px', margin: 0 }}>
          <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Total Orders
          </span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--admin-text-main)', marginTop: '4px' }}>
            {orders.length}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '18px 20px', margin: 0 }}>
          <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Confirmed Paid Orders
          </span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2E7D32', marginTop: '4px' }}>
            {paidCount}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '18px 20px', margin: 0 }}>
          <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Online Revenue (Razorpay)
          </span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#7B5B3A', marginTop: '4px' }}>
            {formatPrice(totalRevenue)}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`admin-btn admin-btn--sm ${
              filterStatus === st ? 'admin-btn--primary' : 'admin-btn--secondary'
            }`}
            style={{ textTransform: 'capitalize' }}
          >
            {st} ({st === 'all' ? orders.length : orders.filter((o) => o.order_status === st).length})
          </button>
        ))}
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span className="admin-spinner" />
            <p style={{ marginTop: '12px', color: 'var(--admin-text-muted)' }}>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--admin-text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--admin-text-main)' }}>
              No orders found matching this filter.
            </p>
            <p style={{ fontSize: '13px' }}>
              When customers complete checkout via Razorpay or WhatsApp, their orders will show here.
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer & Delivery</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>Tracking #</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const isPaid = order.payment_status === 'paid';
                  const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--admin-text-main)' }}>
                          {order.order_number}
                        </strong>
                        <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
                          {dateStr}
                        </div>
                        {order.razorpay_payment_id && (
                          <div style={{ fontSize: '10px', color: '#0E7064', fontFamily: 'monospace', marginTop: '2px' }}>
                            RZP: {order.razorpay_payment_id}
                          </div>
                        )}
                      </td>

                      <td>
                        <strong>{order.customer_name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
                          {order.customer_email}
                        </div>
                        {order.customer_phone && (
                          <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
                            📞 {order.customer_phone}
                          </div>
                        )}
                        {order.shipping_address?.city && (
                          <div style={{ fontSize: '11px', color: '#6B5744', marginTop: '2px' }}>
                            📍 {order.shipping_address.city}, {order.shipping_address.state}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ maxWidth: '240px' }}>
                          {order.items && order.items.length > 0 ? (
                            order.items.map((it) => (
                              <div key={it.id} style={{ fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {it.image_url && (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={it.image_url} alt="" style={{ width: '22px', height: '26px', objectFit: 'cover', borderRadius: '3px' }} />
                                )}
                                <span>
                                  <strong>{it.quantity}x</strong> {it.product_name} ({it.size || 'Std'})
                                </span>
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>Order details</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>
                          {formatPrice(order.total_amount)}
                        </div>
                        {order.coupon_code && (
                          <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>
                            🏷️ {order.coupon_code} (-{formatPrice(order.discount_amount || 0)})
                          </div>
                        )}
                        <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
                          via {order.payment_method}
                        </span>
                      </td>

                      <td>
                        <span
                          className="admin-badge"
                          style={{
                            background: isPaid ? '#E8F5E9' : '#FFF3E0',
                            color: isPaid ? '#2E7D32' : '#E65100',
                          }}
                        >
                          {isPaid ? 'Paid (Razorpay)' : 'Pending'}
                        </span>
                      </td>

                      <td>
                        <select
                          className="admin-select"
                          value={order.order_status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          style={{ minWidth: '120px', fontSize: '12px', padding: '4px 8px' }}
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td>
                        <input
                          type="text"
                          defaultValue={order.tracking_number || ''}
                          placeholder="AWB / Track ID"
                          onBlur={(e) => handleUpdateTracking(order.id, e.target.value)}
                          className="admin-input"
                          style={{ width: '130px', fontSize: '11px', padding: '4px 8px' }}
                        />
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
