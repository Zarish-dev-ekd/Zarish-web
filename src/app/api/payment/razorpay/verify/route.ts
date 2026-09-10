import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderNumber,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { error: 'Missing payment identifiers.' },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature || '',
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment signature verification failed.' },
        { status: 400 }
      );
    }

    // Update order status in Supabase
    const supabase = await createClient();

    const { data: updatedOrder, error: updateErr } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        order_status: 'confirmed',
        razorpay_payment_id,
        razorpay_signature,
        updated_at: new Date().toISOString(),
      })
      .or(`order_number.eq.${orderNumber},razorpay_order_id.eq.${razorpay_order_id}`)
      .select()
      .maybeSingle();

    if (updateErr) {
      console.warn('Could not update order payment status:', updateErr);
    }

    return NextResponse.json({
      success: true,
      verified: true,
      orderNumber: updatedOrder?.order_number || orderNumber,
    });
  } catch (err: any) {
    console.error('Error verifying Razorpay payment:', err);
    return NextResponse.json(
      { error: err?.message || 'Verification processing failed' },
      { status: 500 }
    );
  }
}
