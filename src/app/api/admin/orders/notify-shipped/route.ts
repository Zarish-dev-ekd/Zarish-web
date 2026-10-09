import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendOrderShippedEmail, type SendOrderShippedEmailParams } from '@/lib/email';
import type { Order } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, trackingNumber, trackingUrl } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Query order with items
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json(
        { error: 'Order not found in database' },
        { status: 404 }
      );
    }

    const orderData = order as Order;
    const shippingAddr: any =
      typeof orderData.shipping_address === 'string'
        ? (() => {
            try {
              return JSON.parse(orderData.shipping_address);
            } catch {
              return {};
            }
          })()
        : orderData.shipping_address || {};

    const resolvedTrackingNumber =
      trackingNumber !== undefined
        ? trackingNumber
        : orderData.tracking_number || null;

    const resolvedTrackingUrl =
      trackingUrl !== undefined
        ? trackingUrl
        : orderData.tracking_url || shippingAddr.tracking_url || null;

    const itemsSubtotal = (orderData.items || []).reduce(
      (sum, it) => sum + Number(it.total_price || 0),
      0
    );

    const emailParams: SendOrderShippedEmailParams = {
      orderNumber: orderData.order_number,
      customerName: orderData.customer_name,
      customerEmail: orderData.customer_email,
      customerPhone: orderData.customer_phone || shippingAddr.phone,
      trackingNumber: resolvedTrackingNumber,
      trackingUrl: resolvedTrackingUrl,
      shippingAddress: {
        addressLine1: shippingAddr.addressLine1,
        addressLine2: shippingAddr.addressLine2,
        city: shippingAddr.city,
        state: shippingAddr.state,
        postalCode: shippingAddr.postalCode,
        country: shippingAddr.country || 'India',
        phone: shippingAddr.phone || orderData.customer_phone || undefined,
        deliveryMethod: shippingAddr.deliveryMethod,
        deliveryMethodTitle: shippingAddr.deliveryMethodTitle,
        deliveryFee: shippingAddr.deliveryFee,
        deliveryTime: shippingAddr.deliveryTime,
      },
      items: (orderData.items || []).map((it) => ({
        name: it.product_name,
        size: it.size,
        quantity: it.quantity,
        unitPrice: it.unit_price,
        totalPrice: it.total_price,
        imageUrl: it.image_url,
      })),
      subtotal: itemsSubtotal || orderData.total_amount,
      discountAmount: orderData.discount_amount || 0,
      totalAmount: orderData.total_amount,
      paymentMethod: orderData.payment_method,
    };

    const emailResult = await sendOrderShippedEmail(emailParams);

    if (!emailResult.success) {
      console.warn('[Notify Shipped Route] Email sending warning:', emailResult.error);
      return NextResponse.json({
        success: true,
        emailSent: false,
        warning: emailResult.error || 'Email dispatch skipped or unconfigured',
      });
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      recipient: orderData.customer_email,
    });
  } catch (err: any) {
    console.error('[Notify Shipped Route] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to dispatch shipment notification email' },
      { status: 500 }
    );
  }
}
