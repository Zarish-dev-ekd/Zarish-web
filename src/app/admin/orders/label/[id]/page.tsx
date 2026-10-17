import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/utils/supabase/admin';
import type { Order, ShippingAddress } from '@/lib/types';
import { STORE_SENDER_CONFIG } from '@/lib/indiapost';
import LabelPrintClient from './LabelPrintClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'India Post Shipping Label | ZARISH Admin',
};

interface LabelPageProps {
  params: Promise<{ id: string }>;
}

export default async function IndiaPostLabelPage({ params }: LabelPageProps) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', id)
    .maybeSingle();

  if (!order) {
    notFound();
  }

  const orderData = order as Order;
  const rawAddress: any = orderData.shipping_address || {};
  const addr: ShippingAddress =
    typeof rawAddress === 'string'
      ? (() => {
          try {
            return JSON.parse(rawAddress);
          } catch {
            return {};
          }
        })()
      : rawAddress;

  const trackingBarcode =
    orderData.tracking_number ||
    'SP' + orderData.order_number.replace(/[^0-9]/g, '').slice(-8) + 'IN';
  const isSpeedPost =
    (addr.deliveryMethod || '').toLowerCase().includes('speed') ||
    trackingBarcode.startsWith('SP') ||
    trackingBarcode.startsWith('ET');
  const serviceLabel = isSpeedPost ? 'SPEED POST' : 'BUSINESS PARCEL';

  return (
    <LabelPrintClient
      order={orderData}
      addr={addr}
      trackingBarcode={trackingBarcode}
      isSpeedPost={isSpeedPost}
      serviceLabel={serviceLabel}
      sender={STORE_SENDER_CONFIG}
    />
  );
}
