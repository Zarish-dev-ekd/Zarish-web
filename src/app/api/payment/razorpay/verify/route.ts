import { NextResponse } from 'next/server';
import { verifyRazorpaySignature, fetchRazorpayPayment } from '@/lib/razorpay';
import { fulfillPaidOrder } from '@/lib/orderFulfillment';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderNumber,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required Razorpay payment verification fields.' },
        { status: 400 }
      );
    }

    // ── 1. Cryptographic HMAC SHA256 Signature Verification ──
    const isValidSignature = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValidSignature) {
      console.error('[Payment Verification] Signature verification failed for order:', razorpay_order_id);
      return NextResponse.json(
        { error: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    // ── 2. Authoritative Payment Details Verification from Razorpay API ──
    const payment = await fetchRazorpayPayment(razorpay_payment_id);

    if (payment.order_id !== razorpay_order_id) {
      console.error('[Payment Verification] Payment order ID mismatch:', {
        paymentOrderId: payment.order_id,
        expectedOrderId: razorpay_order_id,
      });
      return NextResponse.json(
        { error: 'Payment does not belong to the given order.' },
        { status: 400 }
      );
    }

    const validStatuses = ['captured', 'authorized'];
    if (!validStatuses.includes(payment.status)) {
      console.error('[Payment Verification] Payment not successful. Status:', payment.status);
      return NextResponse.json(
        { error: `Payment was not captured or authorized (Status: ${payment.status}).` },
        { status: 400 }
      );
    }

    // ── 3. Idempotent Order Fulfillment & Update in Supabase ──
    const fulfillmentResult = await fulfillPaidOrder({
      orderNumber,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentAmountInPaise: payment.amount,
      source: 'verify',
    });

    if (!fulfillmentResult.success) {
      return NextResponse.json(
        { error: fulfillmentResult.error || 'Failed to update order status.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      orderNumber: fulfillmentResult.orderNumber || orderNumber,
      alreadyPaid: Boolean(fulfillmentResult.alreadyPaid),
    });
  } catch (err: any) {
    console.error('[Payment Verification] Route error:', err);
    return NextResponse.json(
      { error: err?.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
