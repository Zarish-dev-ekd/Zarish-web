'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface OrderConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
}

function formatDeliveryEstimate(time?: string | null): string {
  if (!time) return '3 - 5 Business Days';
  const trimmed = time.trim();
  if (/business\s*days/i.test(trimmed)) {
    return trimmed.replace(/(\d+)\s*-\s*(\d+)/, '$1 - $2');
  }
  if (/days/i.test(trimmed)) {
    return trimmed
      .replace(/(\d+)\s*-\s*(\d+)/, '$1 - $2')
      .replace(/days/i, 'Business Days');
  }
  if (/^\d+\s*-\s*\d+$/.test(trimmed)) {
    return `${trimmed.replace(/\s*-\s*/, ' - ')} Business Days`;
  }
  return trimmed;
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderNumber } = use(params);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/track-order?orderNumber=${encodeURIComponent(orderNumber)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.order) {
            setOrderData(json.order);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch order via track API:', err);
      }

      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', orderNumber)
          .maybeSingle();

        if (data) {
          setOrderData(data);
        }
      } catch {}
    }
    if (orderNumber) {
      loadOrder();
    }
  }, [orderNumber]);

  const shippingAddress = typeof orderData?.shipping_address === 'string'
    ? (() => {
        try {
          return JSON.parse(orderData.shipping_address);
        } catch {
          return {};
        }
      })()
    : (orderData?.shipping_address || {});

  const isKerala =
    shippingAddress?.state?.toLowerCase().trim() === 'kerala' ||
    !shippingAddress?.state;

  const rawDeliveryTime =
    shippingAddress?.deliveryTime ||
    (shippingAddress?.deliveryMethodTitle
      ? shippingAddress.deliveryMethodTitle.match(/\(([^)]+)\)/)?.[1]
      : null);

  let resolvedDeliveryTime = rawDeliveryTime;
  if (!resolvedDeliveryTime && shippingAddress?.deliveryMethod) {
    const method = String(shippingAddress.deliveryMethod).toLowerCase();
    if (method.includes('dtdc')) {
      resolvedDeliveryTime = '1-2 Days';
    } else if (method.includes('speed') || method.includes('ems')) {
      resolvedDeliveryTime = isKerala ? '1-3 Days' : '2-5 Days';
    } else if (method.includes('india_post') || method.includes('parcel')) {
      resolvedDeliveryTime = '3-5 Days';
    }
  }

  const deliveryEstimate = orderData
    ? formatDeliveryEstimate(resolvedDeliveryTime || (isKerala ? '3-5 Days' : '2-5 Days'))
    : '3 - 5 Business Days';

  const courierName =
    shippingAddress?.deliveryMethodTitle
      ? shippingAddress.deliveryMethodTitle.replace(/\s*\([^)]*\)/, '').trim()
      : shippingAddress?.deliveryMethod
      ? shippingAddress.deliveryMethod === 'ems_speed_post'
        ? 'EMS Speed Post'
        : shippingAddress.deliveryMethod === 'dtdc'
        ? 'DTDC Express'
        : shippingAddress.deliveryMethod === 'india_post_parcel'
        ? 'India Post Parcel'
        : shippingAddress.deliveryMethod
      : null;

  const paymentDisplay =
    orderData?.payment_method === 'cod'
      ? 'Cash on Delivery (Pending)'
      : 'Online Payment (Verified)';

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
      <Header navigationItems={[]} cartItemCount={0} />

      <main className="flex-1 max-w-[800px] w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#E2D5C7]/80 shadow-[0_8px_30px_rgba(44,29,19,0.06)]">
          {/* Success Checkmark Badge */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#EBF8F2] text-[#0E7064] flex items-center justify-center text-3xl font-bold mb-6 shadow-inner">
            ✓
          </div>

          <p className="text-xs font-bold tracking-[0.2em] text-[#7B5B3A] uppercase mb-2">
            Order Confirmed
          </p>

          <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#2C1D13] mb-4">
            Thank You for Your Order!
          </h1>

          <p className="text-xs sm:text-sm text-[#6B5744] max-w-md mx-auto leading-relaxed mb-6">
            Your garment is being carefully prepared for you. We have emailed your receipt and tracking details to{' '}
            <strong className="text-[#2C1D13]">{orderData?.customer_email || 'your email'}</strong>.
          </p>

          {/* Order Details Card */}
          <div className="bg-[#FAF8F5] border border-[#E2D5C7] rounded-2xl p-4 sm:p-6 max-w-md mx-auto mb-8 text-left space-y-2.5">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#8C7B6B]">Order Reference:</span>
              <strong className="font-mono text-[#2C1D13] font-bold text-sm sm:text-base">
                #{orderNumber}
              </strong>
            </div>
            {courierName && (
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-[#8C7B6B]">Delivery Courier:</span>
                <span className="font-semibold text-[#2C1D13]">{courierName}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#8C7B6B]">Payment Method:</span>
              <span className="font-semibold text-[#2C1D13]">{paymentDisplay}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#8C7B6B]">Delivery Estimate:</span>
              <span className="font-semibold text-[#0E7064]">{deliveryEstimate}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto w-full">
            <Link
              href="/account"
              className="w-full sm:flex-1 min-h-[54px] h-[54px] sm:h-14 shrink-0 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs sm:text-sm font-bold tracking-[0.14em] uppercase transition-all flex items-center justify-center shadow-[0_4px_16px_rgba(44,29,19,0.18)] hover:shadow-[0_6px_20px_rgba(123,91,58,0.25)] active:scale-[0.99]"
            >
              View in My Orders
            </Link>
            <Link
              href="/products"
              className="w-full sm:flex-1 min-h-[54px] h-[54px] sm:h-14 shrink-0 rounded-full border-2 border-[#2C1D13] text-[#2C1D13] hover:bg-[#2C1D13] hover:text-white text-xs sm:text-sm font-bold tracking-[0.14em] uppercase transition-all flex items-center justify-center active:scale-[0.99]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer
        footerGroups={[]}
        brandDescription="ZARISH by Nehala Mufeed — Modest luxury fashion crafted with utmost elegance."
        socialLinks={{}}
      />
    </div>
  );
}
