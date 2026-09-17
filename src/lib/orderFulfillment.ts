import { createAdminClient } from '@/utils/supabase/admin';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '@/lib/email';

export interface FulfillOrderParams {
  orderNumber?: string;
  razorpayOrderId?: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  paymentAmountInPaise: number;
  source: 'verify' | 'webhook';
}

export interface FulfillOrderResult {
  success: boolean;
  alreadyPaid?: boolean;
  orderNumber?: string;
  error?: string;
}

/**
 * Idempotently fulfills a paid order in Supabase:
 * 1. Checks current order status to prevent duplicate processing
 * 2. Validates amount paid against order total in database
 * 3. Updates payment_status to 'PAID' and order_status to 'confirmed'
 * 4. Deducts inventory stock
 * 5. Increments coupon usage count
 * 6. Dispatches customer and admin confirmation emails
 */
export async function fulfillPaidOrder(params: FulfillOrderParams): Promise<FulfillOrderResult> {
  const {
    orderNumber,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    paymentAmountInPaise,
    source,
  } = params;

  try {
    const supabase = createAdminClient();

    // Query order with its line items
    let query = supabase.from('orders').select('*, items:order_items(*)');
    if (orderNumber) {
      query = query.eq('order_number', orderNumber);
    } else if (razorpayOrderId) {
      query = query.eq('razorpay_order_id', razorpayOrderId);
    } else {
      return { success: false, error: 'No order identifier provided' };
    }

    const { data: order, error: fetchErr } = await query.maybeSingle();

    if (fetchErr || !order) {
      console.error(`[Order Fulfillment - ${source}] Order not found:`, { orderNumber, razorpayOrderId });
      return { success: false, error: 'Order not found in database.' };
    }

    // ── IDEMPOTENCY CHECK ──
    const isAlreadyPaid =
      order.payment_status?.toUpperCase() === 'PAID' ||
      order.payment_status?.toLowerCase() === 'paid';

    if (isAlreadyPaid) {
      console.info(
        `[Order Fulfillment - ${source}] Order ${order.order_number} is already marked PAID. Skipping duplicate processing.`
      );
      return {
        success: true,
        alreadyPaid: true,
        orderNumber: order.order_number,
      };
    }

    // ── STRICT AMOUNT VALIDATION ──
    // Amount in database is in INR, paymentAmountInPaise is in paise (₹1 = 100 paise)
    const expectedAmountInPaise = Math.round(Number(order.total_amount) * 100);
    if (Math.abs(paymentAmountInPaise - expectedAmountInPaise) > 1) {
      console.error(
        `[Order Fulfillment - ${source}] Amount mismatch for order ${order.order_number}: received ${paymentAmountInPaise} paise vs expected ${expectedAmountInPaise} paise`
      );
      return {
        success: false,
        error: `Payment amount (${paymentAmountInPaise} paise) does not match order total (${expectedAmountInPaise} paise).`,
      };
    }

    // ── UPDATE ORDER STATUS TO PAID ──
    const updatePayload: Record<string, any> = {
      payment_status: 'PAID',
      order_status: 'confirmed',
      razorpay_payment_id: razorpayPaymentId,
      updated_at: new Date().toISOString(),
    };

    if (razorpaySignature) {
      updatePayload.razorpay_signature = razorpaySignature;
    }

    const { error: updateErr } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', order.id);

    if (updateErr) {
      console.error(`[Order Fulfillment - ${source}] Error updating order to PAID:`, updateErr);
      return { success: false, error: 'Failed to update order status in database.' };
    }

    console.info(`[Order Fulfillment - ${source}] Order ${order.order_number} marked as PAID successfully.`);

    // ── IDEMPOTENT STOCK DEDUCTION ──
    if (Array.isArray(order.items) && order.items.length > 0) {
      for (const item of order.items) {
        if (item.product_id) {
          try {
            const { data: prod } = await supabase
              .from('products')
              .select('id, stock_quantity')
              .eq('id', item.product_id)
              .single();

            if (prod && typeof prod.stock_quantity === 'number') {
              const newStock = Math.max(0, prod.stock_quantity - Number(item.quantity || 1));
              await supabase
                .from('products')
                .update({ stock_quantity: newStock })
                .eq('id', prod.id);
            }
          } catch (stockErr) {
            console.error(`[Order Fulfillment] Error deducting stock for product ${item.product_id}:`, stockErr);
          }
        }
      }
    }

    // ── INCREMENT COUPON USAGE COUNT ──
    if (order.coupon_code) {
      try {
        const { data: coupon } = await supabase
          .from('coupons')
          .select('id, usage_count')
          .eq('code', order.coupon_code)
          .maybeSingle();

        if (coupon) {
          await supabase
            .from('coupons')
            .update({ usage_count: (coupon.usage_count || 0) + 1 })
            .eq('id', coupon.id);
        }
      } catch (couponErr) {
        console.error(`[Order Fulfillment] Error updating coupon usage for ${order.coupon_code}:`, couponErr);
      }
    }

    // ── ASYNCHRONOUS EMAIL DISPATCH ──
    try {
      const emailItems = (order.items || []).map((it: any) => ({
        name: it.product_name || 'Product',
        size: it.size || null,
        color: null,
        quantity: Number(it.quantity || 1),
        unitPrice: Number(it.unit_price || 0),
        totalPrice: Number(it.total_price || 0),
        imageUrl: it.image_url || null,
      }));

      const emailPayload = {
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        shippingAddress: order.shipping_address,
        items: emailItems,
        subtotal: Number(order.total_amount) + Number(order.discount_amount || 0),
        discountAmount: Number(order.discount_amount || 0),
        totalAmount: Number(order.total_amount),
        paymentMethod: 'Razorpay Online Payment',
        notes: order.notes,
      };

      Promise.all([
        sendOrderConfirmationEmail(emailPayload),
        sendAdminNewOrderEmail(emailPayload),
      ]).catch((emailErr) => {
        console.error('[Order Fulfillment] Background email delivery error:', emailErr);
      });
    } catch (emailPrepErr) {
      console.error('[Order Fulfillment] Error preparing emails:', emailPrepErr);
    }

    return {
      success: true,
      orderNumber: order.order_number,
    };
  } catch (err: any) {
    console.error(`[Order Fulfillment - ${source}] Unexpected error:`, err);
    return { success: false, error: err?.message || 'Order fulfillment failed' };
  }
}
