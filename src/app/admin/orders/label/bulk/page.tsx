import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/utils/supabase/admin';
import type { Order, ShippingAddress } from '@/lib/types';
import { STORE_SENDER_CONFIG } from '@/lib/indiapost';
import BulkLabelPrintClient, { BulkLabelItem } from './BulkLabelPrintClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Bulk India Post Shipping Labels | ZARISH Admin',
};

interface BulkLabelPageProps {
  searchParams: Promise<{ ids?: string }>;
}

export default async function BulkIndiaPostLabelPage({ searchParams }: BulkLabelPageProps) {
  const { ids } = await searchParams;

  if (!ids) {
    notFound();
  }

  const orderIds = ids
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (orderIds.length === 0) {
    notFound();
  }

  const supabase = createAdminClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .in('id', orderIds);

  if (error || !orders || orders.length === 0) {
    notFound();
  }

  const items: BulkLabelItem[] = (orders as Order[]).map((order) => {
    const rawAddress: any = order.shipping_address || {};
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

    const cleanNum = (order.order_number || '').replace(/[^0-9]/g, '').padStart(8, '0').slice(-8);
    const trackingBarcode =
      order.tracking_number ||
      'SP' + cleanNum + 'IN';

    const isSpeedPost =
      (addr.deliveryMethod || '').toLowerCase().includes('speed') ||
      trackingBarcode.startsWith('SP') ||
      trackingBarcode.startsWith('ET');

    const serviceLabel = isSpeedPost ? 'SPEED POST' : 'BUSINESS PARCEL';
    const customerName = addr.fullName || order.customer_name || 'Customer';
    const customerPhone = addr.phone || order.customer_phone || '';
    const bookingDate = new Date(order.created_at).toLocaleDateString('en-GB');

    return {
      order,
      addr,
      trackingBarcode,
      isSpeedPost,
      serviceLabel,
      customerName,
      customerPhone,
      bookingDate,
    };
  });

  return (
    <BulkLabelPrintClient
      items={items}
      sender={STORE_SENDER_CONFIG}
    />
  );
}

