import { NextResponse } from 'next/server';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay';
import { fulfillPaidOrder } from '@/lib/orderFulfillment';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      console.warn('[Razorpay Webhook] Missing x-razorpay-signature header.');
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
    }

    // ── 1. Cryptographic HMAC SHA256 Signature Verification ──
    const isValid = verifyRazorpayWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      console.error('[Razorpay Webhook] Invalid webhook signature detected.');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    console.info(`[Razorpay Webhook] Received verified event: ${eventType} (ID: ${event.id})`);

    // ── 2. Handle Payment/Order Captured & Paid Events Idempotently ──
    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;
      const amountInPaise = Number(paymentEntity?.amount ?? orderEntity?.amount_paid ?? orderEntity?.amount);

      if (razorpayOrderId && razorpayPaymentId && amountInPaise > 0) {
        const result = await fulfillPaidOrder({
          razorpayOrderId,
          razorpayPaymentId,
          paymentAmountInPaise: amountInPaise,
          source: 'webhook',
        });

        if (!result.success) {
          console.error(`[Razorpay Webhook] Failed to fulfill order for ${razorpayOrderId}:`, result.error);
        } else if (result.alreadyPaid) {
          console.info(`[Razorpay Webhook] Order for ${razorpayOrderId} already fulfilled. Idempotent skip.`);
        } else {
          console.info(`[Razorpay Webhook] Order #${result.orderNumber} successfully marked PAID via webhook.`);
        }
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;

      if (razorpayOrderId) {
        const supabase = createAdminClient();
        const { data: order } = await supabase
          .from('orders')
          .select('id, payment_status')
          .eq('razorpay_order_id', razorpayOrderId)
          .maybeSingle();

        if (
          order &&
          order.payment_status?.toUpperCase() !== 'PAID' &&
          order.payment_status?.toLowerCase() !== 'paid'
        ) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              razorpay_payment_id: paymentEntity?.id || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', order.id);
          console.info(`[Razorpay Webhook] Marked order ${razorpayOrderId} as failed.`);
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err: any) {
    console.error('[Razorpay Webhook] Processing error:', err);
    return NextResponse.json(
      { error: err?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
