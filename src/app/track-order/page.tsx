'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/lib/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const queryOrderNumber = searchParams.get('orderNumber') || searchParams.get('order') || '';

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Guest lookup state
  const [guestOrderNumber, setGuestOrderNumber] = useState(queryOrderNumber);
  const [guestContact, setGuestContact] = useState('');
  const [guestError, setGuestError] = useState<string | null>(null);
  const [guestSearching, setGuestSearching] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        setUser(authUser);

        if (authUser) {
          // Fetch orders belonging to this user
          const { data: userOrders } = await supabase
            .from('orders')
            .select(`
              *,
              items:order_items(*)
            `)
            .or(`user_id.eq.${authUser.id},customer_email.eq.${authUser.email}`)
            .order('created_at', { ascending: false });

          if (userOrders && userOrders.length > 0) {
            setOrders(userOrders as Order[]);

            // If a specific order was requested in URL query, select it
            if (queryOrderNumber) {
              const matched = userOrders.find(
                (o) => o.order_number.toLowerCase() === queryOrderNumber.toLowerCase()
              );
              setSelectedOrder((matched as Order) || (userOrders[0] as Order));
            } else {
              setSelectedOrder(userOrders[0] as Order);
            }
          }
        } else if (queryOrderNumber) {
          // Guest lookup from URL query
          const { data: singleOrder } = await supabase
            .from('orders')
            .select(`
              *,
              items:order_items(*)
            `)
            .eq('order_number', queryOrderNumber.trim())
            .maybeSingle();

          if (singleOrder) {
            setSelectedOrder(singleOrder as Order);
          }
        }
      } catch (err) {
        console.error('Error loading track order:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase, queryOrderNumber]);

  // Handle Guest Lookup submit
  const handleGuestLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestOrderNumber.trim()) {
      setGuestError('Please enter your order number (e.g. ZR-123456).');
      return;
    }

    setGuestSearching(true);
    setGuestError(null);

    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('order_number', guestOrderNumber.trim());

      const { data: foundOrder, error } = await query.maybeSingle();

      if (error || !foundOrder) {
        setGuestError('Order not found. Please check your order number or log in.');
        setGuestSearching(false);
        return;
      }

      // If contact provided, verify match
      if (guestContact.trim()) {
        const cleanContact = guestContact.trim().toLowerCase();
        const matchesEmail = foundOrder.customer_email?.toLowerCase() === cleanContact;
        const matchesPhone =
          foundOrder.customer_phone?.includes(cleanContact) ||
          foundOrder.shipping_address?.phone?.includes(cleanContact);

        if (!matchesEmail && !matchesPhone) {
          setGuestError('Order number found, but the phone/email does not match.');
          setGuestSearching(false);
          return;
        }
      }

      setSelectedOrder(foundOrder as Order);
    } catch (err: any) {
      setGuestError(err?.message || 'Error locating order.');
    } finally {
      setGuestSearching(false);
    }
  };

  // Helper to format dates
  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateString;
    }
  };

  // Helper to calculate expected date (5-7 days from order date)
  const getExpectedDate = (createdAt: string, status: string) => {
    try {
      const orderDate = new Date(createdAt);
      if (status === 'delivered') {
        return `Delivered on ${formatDate(createdAt)}`;
      }
      const expected = new Date(orderDate);
      expected.setDate(expected.getDate() + 7);
      return `Expected by ${formatDate(expected.toISOString())}`;
    } catch {
      return 'Expected in 5-7 business days';
    }
  };

  // Status human-readable copy and checkmark
  const getStatusDetails = (status: string, trackingNumber?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return {
          title: 'Delivered',
          message: 'Package delivered to your doorstep. Thank you for choosing ZARISH.',
          color: '#16A34A',
          bgColor: '#F0FDF4',
        };
      case 'shipped':
        return {
          title: 'Shipped',
          message: trackingNumber
            ? `Your order has been dispatched. Tracking number: ${trackingNumber}`
            : 'Your order has been dispatched and is currently on its way to you.',
          color: '#0E7064',
          bgColor: '#F0FDFA',
        };
      case 'processing':
        return {
          title: 'In Production',
          message: 'Your modest garment is being handcrafted and prepared for shipping.',
          color: '#7B5B3A',
          bgColor: '#FAF6F0',
        };
      case 'cancelled':
        return {
          title: 'Cancelled',
          message: 'This order has been cancelled.',
          color: '#DC2626',
          bgColor: '#FEF2F2',
        };
      case 'confirmed':
      case 'placed':
      default:
        return {
          title: 'Confirmed',
          message: "We're preparing these items for shipping.",
          color: '#2C1D13',
          bgColor: '#F9F6F0',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <span className="w-8 h-8 border-2 border-[#7B5B3A] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#8C7B6B] font-medium tracking-wide">Loading tracking details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
      <Header navigationItems={[]} cartItemCount={0} />

      <main className="flex-1 w-full max-w-[560px] mx-auto px-4 py-8 sm:py-12">
        {/* CASE 1: Not logged in AND no selected order */}
        {!user && !selectedOrder && (
          <div className="bg-white rounded-3xl p-7 sm:p-10 border border-[#EADBCE]/80 shadow-[0_8px_30px_rgba(44,29,19,0.04)] text-center">
            <div className="w-14 h-14 rounded-full bg-[#F5EDE3] text-[#7B5B3A] flex items-center justify-center mx-auto mb-5 shadow-xs">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>

            <h1 className="font-display text-2xl font-bold text-[#2C1D13] mb-2">
              Track Your Order
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5744] leading-relaxed mb-6 max-w-sm mx-auto">
              Please log in to your account to view live shipment status, courier dispatch updates, and full purchase history.
            </p>

            <Link
              href="/login?redirect=/track-order"
              className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-md active:scale-98"
            >
              Sign In for Order Tracking
            </Link>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#EADBCE]" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-[#8C7B6B]">
                <span className="bg-white px-3">Or track single order</span>
              </div>
            </div>

            {/* Quick Guest Lookup Form */}
            <form onSubmit={handleGuestLookup} className="text-left space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">
                  Order Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ZR-123456"
                  value={guestOrderNumber}
                  onChange={(e) => setGuestOrderNumber(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2D5C7] bg-[#FAF8F5] text-xs sm:text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D2B1F] mb-1">
                  Phone Number or Email (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Registered phone or email"
                  value={guestContact}
                  onChange={(e) => setGuestContact(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2D5C7] bg-[#FAF8F5] text-xs sm:text-sm text-[#2C1D13] focus:outline-none focus:border-[#7B5B3A] focus:bg-white transition-colors"
                />
              </div>

              {guestError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {guestError}
                </p>
              )}

              <button
                type="submit"
                disabled={guestSearching}
                className="w-full h-11 rounded-xl border border-[#2C1D13] text-[#2C1D13] hover:bg-[#2C1D13] hover:text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {guestSearching ? 'Searching Order...' : 'Check Status'}
              </button>
            </form>
          </div>
        )}

        {/* CASE 2: Logged In but No Orders Found */}
        {user && !selectedOrder && orders.length === 0 && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EADBCE]/80 shadow-xs text-center">
            <div className="w-14 h-14 rounded-full bg-[#F5EDE3] text-[#7B5B3A] flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-bold text-[#2C1D13] mb-2">
              No Orders Found
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5744] mb-6">
              You haven&apos;t placed any orders with this account yet.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 rounded-full bg-[#2C1D13] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#7B5B3A] transition-colors"
            >
              Discover Garments
            </Link>
          </div>
        )}

        {/* CASE 3: Active Order Tracking View (Matches Reference Screenshot) */}
        {selectedOrder && (
          <div className="space-y-4">
            {/* Multiple Orders Selector (if user has more than 1 order) */}
            {orders.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <span className="text-xs font-semibold text-[#8C7B6B] shrink-0">Your Orders:</span>
                {orders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                      selectedOrder.id === ord.id
                        ? 'bg-[#2C1D13] text-white shadow-xs'
                        : 'bg-white border border-[#E2D5C7] text-[#6B5744] hover:border-[#7B5B3A]'
                    }`}
                  >
                    #{ord.order_number}
                  </button>
                ))}
              </div>
            )}

            {/* ── 1. Top Header: Back Arrow, Order #, Status Date ── */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => router.push(user ? '/account' : '/')}
                  className="mt-1 text-[#2C1D13] hover:text-[#7B5B3A] transition-colors cursor-pointer"
                  aria-label="Go back"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                    Order {selectedOrder.order_number}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#71717A] mt-0.5 font-normal">
                    {getStatusDetails(selectedOrder.order_status).title} {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* ── 2. Full-Width "Buy again" Action Button ── */}
            <div>
              <Link
                href="/products"
                className="w-full h-11 rounded-2xl border border-[#D1D5DB] bg-white text-[#2563EB] hover:bg-[#F9FAFB] flex items-center justify-center text-sm font-semibold transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)] active:scale-[0.99]"
              >
                Buy again
              </Link>
            </div>

            {/* ── 3. Shipment Status Card (Expected by & Checkmark) ── */}
            {(() => {
              const statusInfo = getStatusDetails(selectedOrder.order_status, selectedOrder.tracking_number);
              return (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                  <h2 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight mb-4">
                    {getExpectedDate(selectedOrder.created_at, selectedOrder.order_status)}
                  </h2>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#111111]">
                        {statusInfo.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed mt-0.5">
                        {statusInfo.message}
                      </p>
                      <p className="text-xs text-[#A1A1AA] mt-2">
                        {formatDate(selectedOrder.updated_at || selectedOrder.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── 4. Order Items & Pricing Card ── */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 pb-4 border-b border-[#F3F4F6] last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-3.5">
                      {/* Thumbnail with quantity pill badge */}
                      <div className="relative w-16 h-20 sm:w-18 sm:h-22 rounded-xl overflow-hidden bg-[#F4F4F5] shrink-0 border border-[#E4E4E7]">
                        {item.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[#A1A1AA]">
                            ZARISH
                          </div>
                        )}
                        {/* Dark circle badge with item quantity in top-right corner */}
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/90 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                          {item.quantity}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-[#111111] leading-snug">
                          {item.product_name}
                        </h4>
                        <p className="text-xs text-[#71717A] mt-1 font-medium">
                          {item.size ? `Size: ${item.size}` : 'Standard'}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-[#111111] text-right shrink-0">
                      {formatPrice(item.total_price)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#71717A]">Order items registered.</p>
              )}

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-[#F3F4F6] space-y-2 text-sm">
                <div className="flex items-center justify-between text-[#3F3F46]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#111111]">
                    {formatPrice(
                      Number(selectedOrder.total_amount) + Number(selectedOrder.discount_amount || 0)
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#3F3F46]">
                  <span>Shipping</span>
                  <span className="font-medium text-[#111111]">
                    {selectedOrder.shipping_address?.state?.toLowerCase() === 'kerala'
                      ? 'Free'
                      : '₹50.00'}
                  </span>
                </div>

                {selectedOrder.discount_amount && Number(selectedOrder.discount_amount) > 0 ? (
                  <div className="flex items-center justify-between text-[#059669]">
                    <span>Discount {selectedOrder.coupon_code ? `(${selectedOrder.coupon_code})` : ''}</span>
                    <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                  </div>
                ) : null}

                <div className="flex items-baseline justify-between pt-2 border-t border-[#F3F4F6]">
                  <span className="text-base font-bold text-[#111111]">Total</span>
                  <div className="text-right">
                    <span className="text-xs text-[#71717A] mr-1">INR</span>
                    <span className="text-lg font-bold text-[#111111]">
                      {formatPrice(selectedOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 5. Contact & Shipping Address Card ── */}
            {(() => {
              const shippingAddr: any =
                typeof selectedOrder.shipping_address === 'string'
                  ? (() => {
                      try {
                        return JSON.parse(selectedOrder.shipping_address);
                      } catch {
                        return {};
                      }
                    })()
                  : selectedOrder.shipping_address || {};

              return (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                  {/* Contact */}
                  <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] text-xs sm:text-sm">
                    <span className="text-[#71717A]">Contact</span>
                    <span className="text-[#111111] font-medium break-all">
                      {selectedOrder.customer_email}
                    </span>
                  </div>

                  {/* Ship to */}
                  <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] text-xs sm:text-sm pt-3 border-t border-[#F3F4F6]">
                    <span className="text-[#71717A]">Ship to</span>
                    <div className="text-[#111111] space-y-0.5 leading-relaxed font-normal">
                      <p className="font-semibold text-[#111111]">
                        {shippingAddr.fullName || selectedOrder.customer_name}
                      </p>
                      {shippingAddr.addressLine1 && <p>{shippingAddr.addressLine1}</p>}
                      {shippingAddr.addressLine2 && <p>{shippingAddr.addressLine2}</p>}
                      <p>
                        {[shippingAddr.city, shippingAddr.state, shippingAddr.postalCode]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <p>{shippingAddr.country || 'India'}</p>
                      {(shippingAddr.phone || selectedOrder.customer_phone) && (
                        <p className="pt-1 font-mono text-xs text-[#52525B]">
                          📞 {shippingAddr.phone || selectedOrder.customer_phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-[#7B5B3A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
