import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createIndiaPostShippingLabel } from '@/lib/indiapost';
import { sendOrderShippedEmail } from '@/lib/email';
import type { Order } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, serviceType, weightGrams } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch order details
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .maybeSingle();

    if (fetchErr || !order) {
      return NextResponse.json(
        { error: 'Order not found in database' },
        { status: 404 }
      );
    }

    const orderData = order as Order;

    // 2. Call India Post API to generate shipping label
    const labelResult = await createIndiaPostShippingLabel({
      order: orderData,
      serviceType: serviceType || undefined,
      weightGrams: weightGrams || undefined,
    });

    if (!labelResult.success) {
      return NextResponse.json(
        { error: labelResult.error || 'Failed to create label with India Post' },
        { status: 500 }
      );
    }

    const barcode = labelResult.barcode;
    const trackingUrl = `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`;

    // 3. Update order in Supabase with tracking number and mark as shipped
    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        tracking_number: barcode,
        tracking_url: trackingUrl,
        order_status: 'shipped',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateErr) {
      console.warn('[India Post] Order update warning:', updateErr.message);
    }

    // 4. Automatically notify customer via email
    let emailSent = false;
    try {
      if (orderData.customer_email) {
        const addr: any =
          typeof orderData.shipping_address === 'string'
            ? (() => {
                try {
                  return JSON.parse(orderData.shipping_address);
                } catch {
                  return {};
                }
              })()
            : orderData.shipping_address || {};

        const itemsSubtotal = (orderData.items || []).reduce(
          (sum, it) => sum + Number(it.total_price || 0),
          0
        );

        const emailResult = await sendOrderShippedEmail({
          customerName: addr.fullName || orderData.customer_name || 'Customer',
          customerEmail: orderData.customer_email,
          customerPhone: orderData.customer_phone || addr.phone || null,
          orderNumber: orderData.order_number,
          trackingNumber: barcode,
          trackingUrl,
          shippingAddress: {
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            country: addr.country || 'India',
            phone: addr.phone || orderData.customer_phone || undefined,
            deliveryMethod: addr.deliveryMethod,
            deliveryMethodTitle:
              addr.deliveryMethodTitle ||
              (labelResult.serviceType === 'SP' ? 'EMS Speed Post (India Post)' : 'India Post Parcel'),
            deliveryFee: addr.deliveryFee,
            deliveryTime: addr.deliveryTime,
          },
          items: (orderData.items || []).map((it) => ({
            name: it.product_name,
            size: it.size || null,
            color: (it as any).color || null,
            quantity: it.quantity,
            unitPrice: it.unit_price,
            totalPrice: it.total_price || it.unit_price * it.quantity,
            imageUrl: it.image_url || null,
          })),
          subtotal: itemsSubtotal || orderData.total_amount,
          discountAmount: orderData.discount_amount || 0,
          totalAmount: orderData.total_amount,
          paymentMethod: orderData.payment_method,
        });
        emailSent = Boolean(emailResult?.success);
      }
    } catch (emailErr) {
      console.warn('[India Post] Dispatch email warning:', emailErr);
    }

    return NextResponse.json({
      success: true,
      barcode,
      serviceType: labelResult.serviceType,
      isSimulated: labelResult.isSimulated,
      pdfBase64: labelResult.pdfBase64 || null,
      labelUrl: `/admin/orders/label/${orderId}`,
      emailSent,
    });
  } catch (err: any) {
    console.error('[India Post Create Label Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
