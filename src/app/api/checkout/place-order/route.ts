import { NextResponse } from 'next/server';

/**
 * Legacy checkout endpoint.
 * Deprecated in favor of authoritative server-side Razorpay order creation
 * via /api/payment/razorpay/create-order and /api/payment/razorpay/verify.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        'This endpoint has been deprecated. All orders must be initiated via /api/payment/razorpay/create-order.',
    },
    { status: 410 }
  );
}
