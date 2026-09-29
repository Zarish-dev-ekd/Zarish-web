'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/lib/types';
import { IconX } from '@/components/icons';

function renderCourierBadge(shippingAddress?: any) {
  if (!shippingAddress) return null;

  const addr = typeof shippingAddress === 'string'
    ? (() => { try { return JSON.parse(shippingAddress); } catch { return {}; } })()
    : shippingAddress;

  const methodStr = (
    addr.deliveryMethodTitle ||
    addr.deliveryMethod ||
    ''
  ).toLowerCase();

  const title = addr.deliveryMethodTitle || '';
  const time = addr.deliveryTime || (title.match(/\(([^)]+)\)/)?.[1] || '');

  // 1. DTDC Express (Purple highlight)
  if (methodStr.includes('dtdc')) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold mt-1.5 bg-[#FAF5FF] text-[#7E22CE] border border-[#D8B4FE] shadow-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/courier-dtdc.png" alt="DTDC" className="h-3.5 w-auto object-contain max-w-[40px]" />
        <span>DTDC Express</span>
        {time && <span className="text-[10px] font-semibold text-[#9333EA]">({time})</span>}
      </div>
    );
  }

  // 2. EMS Speed Post (Blue highlight)
  if (methodStr.includes('speed') || methodStr.includes('ems')) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold mt-1.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#93C5FD] shadow-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/courier-ems.jpg" alt="EMS" className="h-3 w-auto object-contain rounded-[2px]" />
        <span>EMS Speed Post</span>
        {time && <span className="text-[10px] font-semibold text-[#2563EB]">({time})</span>}
      </div>
    );
  }

  // 3. India Post Parcel (Emerald Green highlight)
  if (methodStr.includes('india_post') || methodStr.includes('parcel')) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold mt-1.5 bg-[#ECFDF5] text-[#065F46] border border-[#6EE7B7] shadow-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/courier-india-post.webp" alt="India Post" className="h-3.5 w-auto object-contain rounded-[2px]" />
        <span>India Post Parcel</span>
        {time && <span className="text-[10px] font-semibold text-[#059669]">({time})</span>}
      </div>
    );
  }

  // 4. Custom named courier
  if (addr.deliveryMethodTitle) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold mt-1.5 bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] shadow-xs">
        <span className="text-xs">🚚</span>
        <span>{addr.deliveryMethodTitle}</span>
      </div>
    );
  }

  // 5. Older order fallback based on state
  const isKerala = addr.state?.toLowerCase().trim() === 'kerala';
  if (isKerala) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold mt-1.5 bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/courier-india-post.webp" alt="India Post" className="h-3.5 w-auto object-contain rounded-[2px]" />
        <span>India Post Parcel (Kerala Standard)</span>
      </div>
    );
  } else if (addr.state) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold mt-1.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#93C5FD]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/courier-ems.jpg" alt="EMS" className="h-3 w-auto object-contain rounded-[2px]" />
        <span>EMS Speed Post (Interstate)</span>
      </div>
    );
  }

  return null;
}

export default function AdminOrdersPage() {
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCourier, setFilterCourier] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Inspect Modal State
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [modalTrackingInput, setModalTrackingInput] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInspectedOrder(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

      if (inspectedOrder && inspectedOrder.id === orderId) {
        setInspectedOrder((prev) => (prev ? { ...prev, order_status: newStatus as any } : null));
      }
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateTracking = async (orderId: string, trackingNumber: string) => {
    try {
      const cleanTracking = trackingNumber.trim() || null;
      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          tracking_number: cleanTracking,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, tracking_number: cleanTracking } : o))
      );

      if (inspectedOrder && inspectedOrder.id === orderId) {
        setInspectedOrder((prev) => (prev ? { ...prev, tracking_number: cleanTracking } : null));
      }
    } catch (err: any) {
      alert('Failed to save tracking number: ' + err.message);
    }
  };

  const handleInspectOrder = (order: Order) => {
    setInspectedOrder(order);
    setModalTrackingInput(order.tracking_number || '');
    setCopiedAddress(false);
  };

  const handleCopyAddress = async (order: Order) => {
    try {
      const addr = typeof order.shipping_address === 'string'
        ? (() => { try { return JSON.parse(order.shipping_address); } catch { return {}; } })()
        : (order.shipping_address || {});

      const lines: string[] = [];
      const name = addr.fullName || order.customer_name;
      if (name) lines.push(name);
      if (addr.addressLine1) lines.push(addr.addressLine1);
      if (addr.addressLine2) lines.push(addr.addressLine2);

      const cityStatePin = [
        addr.city,
        addr.state,
        addr.postalCode ? `- ${addr.postalCode}` : '',
      ].filter(Boolean).join(', ').replace(', -', ' -');

      if (cityStatePin) lines.push(cityStatePin);
      if (addr.country) lines.push(addr.country);
      const phone = addr.phone || order.customer_phone;
      if (phone) lines.push(`Phone: ${phone}`);

      const fullText = lines.join('\n');
      await navigator.clipboard.writeText(fullText);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2200);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleSaveModalTracking = async () => {
    if (!inspectedOrder) return;
    setSavingTracking(true);
    try {
      await handleUpdateTracking(inspectedOrder.id, modalTrackingInput);
    } finally {
      setSavingTracking(false);
    }
  };

  const speedPostCount = orders.filter((o) => {
    const s = (o.shipping_address?.deliveryMethodTitle || o.shipping_address?.deliveryMethod || '').toLowerCase();
    const isKerala = o.shipping_address?.state?.toLowerCase().trim() === 'kerala';
    return s.includes('speed') || s.includes('ems') || (!s && !isKerala && Boolean(o.shipping_address?.state));
  }).length;

  const indiaPostCount = orders.filter((o) => {
    const s = (o.shipping_address?.deliveryMethodTitle || o.shipping_address?.deliveryMethod || '').toLowerCase();
    const isKerala = o.shipping_address?.state?.toLowerCase().trim() === 'kerala';
    return s.includes('india_post') || s.includes('parcel') || (!s && isKerala);
  }).length;

  const dtdcCount = orders.filter((o) => {
    const s = (o.shipping_address?.deliveryMethodTitle || o.shipping_address?.deliveryMethod || '').toLowerCase();
    return s.includes('dtdc');
  }).length;

  const filteredOrders = orders.filter((o) => {
    // 1. Status filter
    if (filterStatus !== 'all' && o.order_status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }

    // 2. Courier filter
    if (filterCourier !== 'all') {
      const s = (o.shipping_address?.deliveryMethodTitle || o.shipping_address?.deliveryMethod || '').toLowerCase();
      const isKerala = o.shipping_address?.state?.toLowerCase().trim() === 'kerala';

      if (filterCourier === 'speed_post') {
        const isSpeed = s.includes('speed') || s.includes('ems') || (!s && !isKerala && Boolean(o.shipping_address?.state));
        if (!isSpeed) return false;
      } else if (filterCourier === 'india_post') {
        const isIndiaPost = s.includes('india_post') || s.includes('parcel') || (!s && isKerala);
        if (!isIndiaPost) return false;
      } else if (filterCourier === 'dtdc') {
        if (!s.includes('dtdc')) return false;
      }
    }

    return true;
  });

  const totalRevenue = orders
    .filter((o) => o.payment_status?.toLowerCase() === 'paid')
    .reduce((acc, o) => acc + Number(o.total_amount), 0);

  const paidCount = orders.filter((o) => o.payment_status?.toLowerCase() === 'paid').length;

  return (
    <div>
      {/* ─── Page Header ─── */}
      <div className="flex items-center justify-between mb-5 max-sm:flex-col max-sm:items-start max-sm:gap-3">
        <div>
          <h2 className="font-serif text-2xl sm:text-[26px] text-[#2C241E] m-0 mb-1 font-semibold">
            Customer Orders & Payments
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6F66] m-0">
            Track customer orders, full shipping addresses, Razorpay transactions, and courier dispatches.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <span>↺ Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-[#FFEBEE] text-[#D32F2F] border border-[#FECACA] rounded-lg p-3.5 px-4 mb-4 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* ─── KPI Stats Bar ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <span className="text-[11px] text-[#7A6F66] uppercase tracking-[0.05em] font-semibold">
            Total Orders
          </span>
          <div className="text-2xl font-bold text-[#2C241E] mt-0.5">
            {orders.length}
          </div>
        </div>

        <div className="bg-white border border-[#E8E0D5] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <span className="text-[11px] text-[#7A6F66] uppercase tracking-[0.05em] font-semibold">
            Confirmed Paid Orders
          </span>
          <div className="text-2xl font-bold text-[#2E7D32] mt-0.5">
            {paidCount}
          </div>
        </div>

        <div className="bg-white border border-[#E8E0D5] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <span className="text-[11px] text-[#7A6F66] uppercase tracking-[0.05em] font-semibold">
            Online Revenue (Razorpay)
          </span>
          <div className="text-2xl font-bold text-[#7B5B3A] mt-0.5">
            {formatPrice(totalRevenue)}
          </div>
        </div>
      </div>

      {/* ─── Status Filter Tabs ─── */}
      <div className="flex gap-1.5 sm:gap-2 mb-2.5 overflow-x-auto pb-1 sm:flex-wrap no-scrollbar">
        {['all', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`capitalize px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filterStatus === st
                ? 'bg-[#7B5B3A] text-white font-semibold shadow-xs'
                : 'border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0]'
            }`}
          >
            {st} ({st === 'all' ? orders.length : orders.filter((o) => o.order_status === st).length})
          </button>
        ))}
      </div>

      {/* ─── Courier Method Quick Filters ─── */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-4 overflow-x-auto pb-1 sm:flex-wrap text-xs no-scrollbar">
        <span className="text-[#7A6F66] font-semibold text-[11px] uppercase tracking-wider mr-1 whitespace-nowrap">
          Courier:
        </span>
        <button
          type="button"
          onClick={() => setFilterCourier('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            filterCourier === 'all'
              ? 'bg-[#2C241E] text-white font-semibold shadow-xs'
              : 'border border-[#E8E0D5] bg-white text-[#6B5744] hover:bg-[#FAF8F5]'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterCourier('speed_post')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all inline-flex items-center gap-1.5 cursor-pointer ${
            filterCourier === 'speed_post'
              ? 'bg-[#1D4ED8] text-white shadow-xs'
              : 'border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]'
          }`}
        >
          <span>⚡ Speed Post</span>
          <span className="text-[11px] opacity-80">({speedPostCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterCourier('india_post')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all inline-flex items-center gap-1.5 cursor-pointer ${
            filterCourier === 'india_post'
              ? 'bg-[#065F46] text-white shadow-xs'
              : 'border border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] hover:bg-[#D1FAE5]'
          }`}
        >
          <span>📦 India Post</span>
          <span className="text-[11px] opacity-80">({indiaPostCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterCourier('dtdc')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all inline-flex items-center gap-1.5 cursor-pointer ${
            filterCourier === 'dtdc'
              ? 'bg-[#7E22CE] text-white shadow-xs'
              : 'border border-[#E9D5FF] bg-[#FAF5FF] text-[#7E22CE] hover:bg-[#F3E8FF]'
          }`}
        >
          <span>🚀 DTDC Express</span>
          <span className="text-[11px] opacity-80">({dtdcCount})</span>
        </button>
      </div>

      {/* ─── Orders Content Area ─── */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl p-3 sm:p-5 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {loading ? (
          <div className="text-center py-12">
            <span className="w-6 h-6 border-2 border-[#E8E0D5] border-t-[#7B5B3A] rounded-full animate-spin inline-block" />
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
          <>
            {/* ─── MOBILE VIEW: Touch-Friendly Responsive Card List (< md) ─── */}
            <div className="md:hidden space-y-3">
              {filteredOrders.map((order) => {
                const isPaid = order.payment_status?.toLowerCase() === 'paid';
                const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const cleanPhone = (order.customer_phone || '').replace(/\D/g, '');
                const addr = typeof order.shipping_address === 'string'
                  ? (() => { try { return JSON.parse(order.shipping_address); } catch { return {}; } })()
                  : (order.shipping_address || {});

                return (
                  <div
                    key={order.id}
                    className="border border-[#E8E0D5] rounded-xl p-3.5 bg-white shadow-xs hover:border-[#D1C2B0] transition-colors"
                  >
                    {/* Top Row: Order # + Date + Paid Badge */}
                    <div className="flex items-start justify-between gap-2 border-b border-[#F0EBE1] pb-2.5 mb-2.5">
                      <div>
                        <div className="font-mono font-bold text-xs sm:text-sm text-[#2C241E]">
                          {order.order_number}
                        </div>
                        <div className="text-[11px] text-[#7A6F66]">{dateStr}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-[#2C241E]">
                          {formatPrice(order.total_amount)}
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase mt-0.5 ${
                            isPaid ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#E65100]'
                          }`}
                        >
                          {isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Location */}
                    <div className="flex items-center justify-between gap-2 text-xs mb-2">
                      <div className="min-w-0">
                        <strong className="text-[#2C241E] truncate block text-[13px]">
                          {order.customer_name}
                        </strong>
                        {(addr.city || addr.state) && (
                          <span className="text-[11px] text-[#7A6F66]">
                            📍 {addr.city ? `${addr.city}, ` : ''}{addr.state || ''}
                          </span>
                        )}
                      </div>

                      {/* Quick Contact Buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {order.customer_phone && (
                          <a
                            href={`tel:${order.customer_phone}`}
                            className="px-2 py-1 bg-[#FAF6F0] border border-[#E8E0D5] rounded-md text-[11px] text-[#7B5B3A] font-medium no-underline hover:bg-[#7B5B3A] hover:text-white transition-colors"
                            title="Call customer"
                          >
                            📞 Call
                          </a>
                        )}
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                              `Hello ${order.customer_name}, this is ZARISH customer support regarding your order #${order.order_number}.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-md text-[11px] text-[#065F46] font-medium no-underline hover:bg-[#065F46] hover:text-white transition-colors"
                            title="WhatsApp customer"
                          >
                            💬 WA
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Courier Badge */}
                    <div className="mb-2.5">
                      {renderCourierBadge(order.shipping_address)}
                    </div>

                    {/* Items Preview */}
                    <div className="bg-[#FAF8F5] border border-[#EFEBE4] rounded-lg p-2 mb-3 text-xs">
                      <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                        {order.items && order.items.length > 0 ? (
                          order.items.slice(0, 3).map((it) => (
                            <div key={it.id} className="flex items-center gap-1.5 flex-shrink-0">
                              {it.image_url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={it.image_url}
                                  alt=""
                                  className="w-7 h-8 object-cover rounded-[3px] border border-[#E8E0D5]"
                                />
                              ) : (
                                <div className="w-7 h-8 bg-[#E8E0D5] rounded-[3px] flex items-center justify-center text-[10px]">
                                  👗
                                </div>
                              )}
                              <span className="text-[11px] text-[#5C4A3C]">
                                <strong>{it.quantity}x</strong> {it.size || 'Std'}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] text-[#7A6F66]">Order items</span>
                        )}
                        {order.items && order.items.length > 3 && (
                          <span className="text-[10px] text-[#7A6F66] font-semibold">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Status & Actions */}
                    <div className="grid grid-cols-2 gap-2 mb-2.5">
                      <div>
                        <label className="text-[10px] font-semibold uppercase text-[#7A6F66] tracking-wider block mb-1">
                          Status
                        </label>
                        <select
                          className="w-full text-xs px-2 py-1.5 border border-[#E8E0D5] rounded-md bg-white text-[#2C241E] font-medium outline-none focus:border-[#7B5B3A]"
                          value={order.order_status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold uppercase text-[#7A6F66] tracking-wider block mb-1">
                          Courier AWB #
                        </label>
                        <input
                          type="text"
                          placeholder="AWB / Tracking #"
                          defaultValue={order.tracking_number || ''}
                          className="w-full text-xs px-2 py-1.5 border border-[#E8E0D5] rounded-md bg-[#FAF8F5] text-[#2C241E] outline-none focus:bg-white focus:border-[#7B5B3A]"
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
                    </div>

                    {/* PRIMARY ACTION: Inspect Button */}
                    <button
                      type="button"
                      onClick={() => handleInspectOrder(order)}
                      className="w-full py-2.5 px-3 rounded-lg bg-[#2C241E] hover:bg-[#43362A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-[0.99]"
                    >
                      <span>🔍</span>
                      <span>Inspect Order & Full Address</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ─── DESKTOP VIEW: Full Structured Table (>= md) ─── */}
            <div className="hidden md:block overflow-x-auto border border-[#E8E0D5] rounded-lg">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#FAF8F5]">
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">
                      Order #
                    </th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">
                      Customer & Delivery
                    </th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">
                      Items
                    </th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">
                      Amount
                    </th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">
                      Payment
                    </th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5]">
                      Status & Tracking
                    </th>
                    <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.05em] text-[#7A6F66] border-b border-[#E8E0D5] text-center">
                      Action
                    </th>
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
                    const addr = typeof order.shipping_address === 'string'
                      ? (() => { try { return JSON.parse(order.shipping_address); } catch { return {}; } })()
                      : (order.shipping_address || {});

                    return (
                      <tr key={order.id} className="hover:bg-black/[0.01]">
                        {/* 1. Order Number & Date */}
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                          <strong className="font-mono text-[#2C241E]">
                            {order.order_number}
                          </strong>
                          <div className="text-[11px] text-[#7A6F66]">{dateStr}</div>
                          {order.razorpay_payment_id && (
                            <div className="text-[10px] text-[#0E7064] font-mono mt-0.5">
                              RZP: {order.razorpay_payment_id}
                            </div>
                          )}
                        </td>

                        {/* 2. Customer & Courier */}
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
                          {addr.city && (
                            <div className="text-[11px] text-[#6B5744] mt-0.5">
                              📍 {addr.city}, {addr.state}
                            </div>
                          )}
                          {renderCourierBadge(order.shipping_address)}
                        </td>

                        {/* 3. Items */}
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                          <div className="max-w-[220px]">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((it) => (
                                <div key={it.id} className="text-xs mb-1 flex items-center gap-1.5">
                                  {it.image_url && (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={it.image_url}
                                      alt=""
                                      className="w-[22px] h-[26px] object-cover rounded-[3px]"
                                    />
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

                        {/* 4. Amount */}
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

                        {/* 5. Payment Status */}
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle">
                          <span
                            className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded uppercase ${
                              isPaid ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#E65100]'
                            }`}
                          >
                            {isPaid ? 'Paid' : 'Pending'}
                          </span>
                        </td>

                        {/* 6. Order Status & Tracking */}
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
                        </td>

                        {/* 7. Action: Inspect Button */}
                        <td className="px-4 py-3.5 border-b border-[#E8E0D5] align-middle text-center">
                          <button
                            type="button"
                            onClick={() => handleInspectOrder(order)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#7B5B3A] bg-[#FAF6F0] text-[#7B5B3A] text-xs font-semibold hover:bg-[#7B5B3A] hover:text-white transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
                            title="Inspect full address & order details"
                          >
                            <span>🔍</span>
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ─── INSPECT ORDER MODAL (POPUP DIALOG) ─── */}
      {inspectedOrder && (() => {
        const isPaid = inspectedOrder.payment_status?.toLowerCase() === 'paid';
        const dateStr = new Date(inspectedOrder.created_at).toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const addr = typeof inspectedOrder.shipping_address === 'string'
          ? (() => { try { return JSON.parse(inspectedOrder.shipping_address); } catch { return {}; } })()
          : (inspectedOrder.shipping_address || {});
        const cleanPhone = (addr.phone || inspectedOrder.customer_phone || '').replace(/\D/g, '');

        // Calculate Subtotal
        const itemsSubtotal = (inspectedOrder.items || []).reduce(
          (sum, it) => sum + Number(it.total_price || 0),
          0
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            {/* Backdrop click to close */}
            <div
              className="fixed inset-0"
              onClick={() => setInspectedOrder(null)}
              aria-hidden="true"
            />

            {/* Modal Dialog Card */}
            <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E8E0D5] flex flex-col max-h-[92vh] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-[#E8E0D5] bg-[#FAF8F5] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-mono text-[#2C241E]">
                      {inspectedOrder.order_number}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        isPaid ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#E65100]'
                      }`}
                    >
                      {isPaid ? 'Paid (Razorpay)' : 'Payment Pending'}
                    </span>
                  </div>
                  <div className="text-xs text-[#7A6F66] mt-0.5">{dateStr}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectedOrder(null)}
                  className="p-1.5 rounded-lg text-[#7A6F66] hover:text-[#2C241E] hover:bg-black/5 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <IconX size={20} />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
                {/* 1. Full Shipping Address Box with 1-Click Copy */}
                <div className="bg-[#FAF8F5] border-2 border-[#E2D5C7] rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E8E0D5]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">📍</span>
                      <span className="text-xs uppercase font-bold tracking-wider text-[#5C4A3C]">
                        Shipping & Delivery Address
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyAddress(inspectedOrder)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2C241E] hover:bg-[#43362A] text-white transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Copy complete address for India Post / DTDC shipping booking"
                    >
                      {copiedAddress ? (
                        <>
                          <span className="text-[#34D399] font-bold">✓</span>
                          <span className="text-[#34D399]">Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <span>📋</span>
                          <span>Copy Full Address</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-sm text-[#2C241E] leading-relaxed space-y-1">
                    <div className="font-bold text-[15px] text-[#2C241E]">
                      {addr.fullName || inspectedOrder.customer_name}
                    </div>
                    {addr.addressLine1 && <div>{addr.addressLine1}</div>}
                    {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                    <div>
                      {[
                        addr.city,
                        addr.state,
                        addr.postalCode ? `- ${addr.postalCode}` : '',
                      ]
                        .filter(Boolean)
                        .join(', ')
                        .replace(', -', ' -')}
                    </div>
                    <div>{addr.country || 'India'}</div>
                    <div className="font-semibold text-xs text-[#7B5B3A] pt-1">
                      Phone: {addr.phone || inspectedOrder.customer_phone || 'Not provided'}
                    </div>
                  </div>
                </div>

                {/* 2. Customer Contact & Direct Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border border-[#E8E0D5] rounded-xl p-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#7A6F66] font-semibold block mb-1">
                      Customer Contact
                    </span>
                    <div className="font-semibold text-sm text-[#2C241E]">
                      {inspectedOrder.customer_name}
                    </div>
                    <a
                      href={`mailto:${inspectedOrder.customer_email}`}
                      className="text-xs text-[#7B5B3A] hover:underline block mt-0.5 truncate"
                    >
                      ✉️ {inspectedOrder.customer_email}
                    </a>
                    {inspectedOrder.customer_phone && (
                      <div className="text-xs text-[#5C4A3C] mt-0.5">
                        📞 {inspectedOrder.customer_phone}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center gap-2 pt-2 sm:pt-0 sm:border-l sm:border-[#E8E0D5] sm:pl-4">
                    {inspectedOrder.customer_phone && (
                      <a
                        href={`tel:${inspectedOrder.customer_phone}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E0D5] bg-[#FAF8F5] text-[#2C241E] text-xs font-semibold hover:bg-white transition-colors no-underline"
                      >
                        <span>📞</span>
                        <span>Call Customer</span>
                      </a>
                    )}
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                          `Hello ${inspectedOrder.customer_name}, this is ZARISH customer support regarding your order #${inspectedOrder.order_number}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] text-xs font-semibold hover:bg-[#D1FAE5] transition-colors no-underline"
                      >
                        <span>💬</span>
                        <span>Direct WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* 3. Courier Partner & Tracking */}
                <div className="bg-white border border-[#E8E0D5] rounded-xl p-4">
                  <span className="text-[11px] uppercase tracking-wider text-[#7A6F66] font-semibold block mb-2">
                    Chosen Courier Partner
                  </span>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div>{renderCourierBadge(inspectedOrder.shipping_address)}</div>
                    <div className="text-xs font-semibold text-[#5C4A3C]">
                      Courier Fee: {formatPrice(addr.deliveryFee || 0)}
                    </div>
                  </div>

                  {/* AWB Tracking Input */}
                  <div className="mt-3 pt-3 border-t border-[#F0EBE1]">
                    <label className="text-xs font-semibold text-[#2C241E] block mb-1">
                      Tracking / AWB Number:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. ED123456789IN or DTDC789012"
                        value={modalTrackingInput}
                        onChange={(e) => setModalTrackingInput(e.target.value)}
                        className="flex-1 text-xs px-3 py-2 border border-[#E8E0D5] rounded-lg bg-[#FAF8F5] text-[#2C241E] outline-none focus:bg-white focus:border-[#7B5B3A]"
                      />
                      <button
                        type="button"
                        onClick={handleSaveModalTracking}
                        disabled={savingTracking}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#7B5B3A] text-white hover:bg-[#63472C] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {savingTracking ? 'Saving...' : 'Save AWB'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="text-[11px] text-[#7A6F66]">
                        {inspectedOrder.tracking_number ? (
                          <span className="text-[#0E7064] font-medium">✓ Saved: {inspectedOrder.tracking_number}</span>
                        ) : (
                          'No AWB saved yet'
                        )}
                      </span>
                      <a
                        href={`/track-order?orderNumber=${encodeURIComponent(inspectedOrder.order_number)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#7B5B3A] hover:underline font-semibold"
                      >
                        View Live Tracking Page →
                      </a>
                    </div>
                  </div>
                </div>

                {/* 4. Ordered Items Breakdown */}
                <div className="bg-white border border-[#E8E0D5] rounded-xl p-4">
                  <span className="text-[11px] uppercase tracking-wider text-[#7A6F66] font-semibold block mb-3">
                    Ordered Items ({(inspectedOrder.items || []).length})
                  </span>
                  <div className="divide-y divide-[#F0EBE1]">
                    {(inspectedOrder.items || []).map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={item.image_url}
                              alt=""
                              className="w-11 h-14 object-cover rounded-md border border-[#E8E0D5] bg-[#FAF8F5]"
                            />
                          ) : (
                            <div className="w-11 h-14 bg-[#FAF8F5] rounded-md border border-[#E8E0D5] flex items-center justify-center text-base">
                              👗
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-sm text-[#2C241E]">
                              {item.product_name}
                            </div>
                            <div className="text-[11px] text-[#7A6F66] mt-0.5">
                              Size: <strong className="text-[#2C241E]">{item.size || 'Standard'}</strong>
                            </div>
                            <div className="text-[11px] text-[#7A6F66]">
                              {formatPrice(item.unit_price)} × {item.quantity}
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-bold text-sm text-[#2C241E]">
                          {formatPrice(item.total_price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Financial Summary & Razorpay */}
                <div className="bg-[#FAF8F5] border border-[#E8E0D5] rounded-xl p-4 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#7A6F66]">
                    <span>Items Subtotal</span>
                    <span>{formatPrice(itemsSubtotal || inspectedOrder.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-[#7A6F66]">
                    <span>Courier Delivery Fee</span>
                    <span>{formatPrice(addr.deliveryFee || 0)}</span>
                  </div>
                  {inspectedOrder.coupon_code && (
                    <div className="flex justify-between text-[#047857] font-semibold">
                      <span>Coupon ({inspectedOrder.coupon_code})</span>
                      <span>-{formatPrice(inspectedOrder.discount_amount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-[#2C241E] pt-2 border-t border-[#E8E0D5]">
                    <span>Total Amount Paid</span>
                    <span className="text-base text-[#7B5B3A]">
                      {formatPrice(inspectedOrder.total_amount)}
                    </span>
                  </div>

                  <div className="pt-2 text-[11px] text-[#7A6F66]">
                    Payment Gateway: <strong className="text-[#2C241E]">{inspectedOrder.payment_method}</strong>
                    {inspectedOrder.razorpay_payment_id && (
                      <span className="block font-mono text-[10px] text-[#0E7064]">
                        Payment ID: {inspectedOrder.razorpay_payment_id}
                      </span>
                    )}
                    {inspectedOrder.razorpay_order_id && (
                      <span className="block font-mono text-[10px] text-[#7A6F66]">
                        Razorpay Order: {inspectedOrder.razorpay_order_id}
                      </span>
                    )}
                  </div>
                </div>

                {/* 6. Update Status Selector */}
                <div className="bg-white border border-[#E8E0D5] rounded-xl p-4">
                  <label className="text-xs font-semibold text-[#2C241E] block mb-1.5">
                    Update Order Status:
                  </label>
                  <select
                    className="w-full text-sm px-3 py-2 border border-[#E8E0D5] rounded-lg bg-white text-[#2C241E] font-medium outline-none focus:border-[#7B5B3A]"
                    value={inspectedOrder.order_status}
                    onChange={(e) => handleUpdateStatus(inspectedOrder.id, e.target.value)}
                  >
                    <option value="placed">Placed (Order Received)</option>
                    <option value="confirmed">Confirmed (Payment Verified)</option>
                    <option value="processing">Processing (Being Handcrafted)</option>
                    <option value="shipped">Shipped (Dispatched with Courier)</option>
                    <option value="delivered">Delivered (Completed)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 border-t border-[#E8E0D5] bg-[#FAF8F5] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleCopyAddress(inspectedOrder)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#E8E0D5] bg-white text-[#2C241E] hover:bg-[#F8F5F0] transition-colors cursor-pointer"
                >
                  {copiedAddress ? '✓ Address Copied' : '📋 Copy Address'}
                </button>

                <button
                  type="button"
                  onClick={() => setInspectedOrder(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#2C241E] text-white hover:bg-[#43362A] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
