import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, orderAmount = 0 } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Please enter a coupon code.' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const supabase = await createClient();

    const { data: coupon, error: couponErr } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .maybeSingle();

    if (couponErr || !coupon) {
      return NextResponse.json(
        { valid: false, error: 'Coupon code not found or invalid.' },
        { status: 404 }
      );
    }

    // Check active status
    if (!coupon.is_active) {
      return NextResponse.json(
        { valid: false, error: 'This coupon is currently deactivated.' },
        { status: 400 }
      );
    }

    // Check expiration date
    if (coupon.valid_until) {
      const expiry = new Date(coupon.valid_until);
      if (expiry < new Date()) {
        return NextResponse.json(
          { valid: false, error: 'This coupon has expired.' },
          { status: 400 }
        );
      }
    }

    // Check minimum order value
    const parsedAmount = Number(orderAmount) || 0;
    const minOrder = Number(coupon.min_order_value) || 0;
    if (minOrder > 0 && parsedAmount < minOrder) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum order value of ₹${minOrder.toLocaleString('en-IN')} required to use this coupon.`,
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((parsedAmount * Number(coupon.discount_value)) / 100);
    } else {
      // fixed amount
      discount = Math.min(parsedAmount, Number(coupon.discount_value));
    }

    const finalAmount = Math.max(0, parsedAmount - discount);

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
      discountAmount: discount,
      finalAmount,
      message: `Coupon ${coupon.code} applied! You save ₹${discount.toLocaleString('en-IN')}.`,
    });
  } catch (err: any) {
    console.error('Coupon validation error:', err);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate coupon code.' },
      { status: 500 }
    );
  }
}
