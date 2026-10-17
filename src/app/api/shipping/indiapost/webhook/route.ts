import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * India Post Webhook Receiver
 * Listens for real-time tracking events (Booking, Transit, Out for Delivery, Delivered)
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('[India Post Webhook Received]:', JSON.stringify(payload));

    const articleNumber = payload.article_number || payload.barcode_no;
    const eventCode = (payload.event_code || '').toUpperCase();
    const eventDesc = payload.event_description || '';

    if (!articleNumber) {
      return NextResponse.json({ success: true, message: 'No article_number in payload' });
    }

    const supabase = createAdminClient();

    // Find the order by tracking number
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, order_status')
      .ilike('tracking_number', articleNumber.trim())
      .maybeSingle();

    if (error || !order) {
      console.warn('[India Post Webhook] No matching order found for barcode:', articleNumber);
      return NextResponse.json({ success: true, message: 'Order not found for tracking number' });
    }

    // Determine status update
    let newStatus: string | null = null;
    if (
      eventCode.includes('DELIVER') ||
      eventDesc.toLowerCase().includes('delivered')
    ) {
      newStatus = 'delivered';
    } else if (
      eventCode.includes('DISPATCH') ||
      eventCode.includes('BAG') ||
      eventCode.includes('BOOK')
    ) {
      if (order.order_status !== 'delivered') {
        newStatus = 'shipped';
      }
    }

    if (newStatus && newStatus !== order.order_status) {
      await supabase
        .from('orders')
        .update({
          order_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      console.log(`[India Post Webhook] Order ${order.order_number} status updated to: ${newStatus}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Event processed successfully',
      article_number: articleNumber,
    });
  } catch (err: any) {
    console.error('[India Post Webhook Error]:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
