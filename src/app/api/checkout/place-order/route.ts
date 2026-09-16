import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      productId,
      quantity = 1,
      size = 'Standard',
      color = null,
      customer,
      shippingAddress,
      paymentMethod = 'online', // 'online' only
      couponCode = null,
      notes = null,
    } = body;

    if (!customer?.email || !customer?.fullName) {
      return NextResponse.json(
        { error: 'Customer name and email are required.' },
        { status: 400 }
      );
    }

    if (!shippingAddress?.addressLine1 || !shippingAddress?.city || !shippingAddress?.postalCode) {
      return NextResponse.json(
        { error: 'Complete shipping address (address line, city, pincode) is required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check user auth if logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let calculatedTotal = 0;
    const orderItemsToInsert: Array<{
      product_id: string;
      product_name: string;
      size: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      image_url?: string;
    }> = [];

    const emailItems: Array<{
      name: string;
      size?: string | null;
      color?: string | null;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      imageUrl?: string | null;
    }> = [];

    // Case 1: Single item purchase from Product detail page
    if (productId) {
      const { data: product, error: prodErr } = await supabase
        .from('products')
        .select(`*, images:product_images(*)`)
        .eq('id', productId)
        .single();

      if (prodErr || !product) {
        return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
      }

      const unitPrice = Number(product.price);
      const q = Math.max(1, Number(quantity));
      const totalItemPrice = unitPrice * q;
      calculatedTotal += totalItemPrice;

      const primaryImg =
        product.images?.find((img: any) => img.role === 'primary')?.secure_url ||
        product.images?.[0]?.secure_url ||
        '';

      orderItemsToInsert.push({
        product_id: product.id,
        product_name: product.name,
        size: size || 'Standard',
        quantity: q,
        unit_price: unitPrice,
        total_price: totalItemPrice,
        image_url: primaryImg,
      });

      emailItems.push({
        name: product.name,
        size: size || 'Standard',
        color: color || null,
        quantity: q,
        unitPrice,
        totalPrice: totalItemPrice,
        imageUrl: primaryImg,
      });
    } else if (Array.isArray(items) && items.length > 0) {
      // Case 2: Multi-item cart purchase
      for (const it of items) {
        const { data: prod } = await supabase
          .from('products')
          .select(`*, images:product_images(*)`)
          .eq('id', it.productId)
          .single();

        if (prod) {
          const unitPrice = Number(prod.price);
          const q = Math.max(1, Number(it.quantity || 1));
          const totalItemPrice = unitPrice * q;
          calculatedTotal += totalItemPrice;

          const primaryImg =
            prod.images?.find((img: any) => img.role === 'primary')?.secure_url ||
            prod.images?.[0]?.secure_url ||
            '';

          orderItemsToInsert.push({
            product_id: prod.id,
            product_name: prod.name,
            size: it.size || 'Standard',
            quantity: q,
            unit_price: unitPrice,
            total_price: totalItemPrice,
            image_url: primaryImg,
          });

          emailItems.push({
            name: prod.name,
            size: it.size || 'Standard',
            color: it.color || null,
            quantity: q,
            unitPrice,
            totalPrice: totalItemPrice,
            imageUrl: primaryImg,
          });
        }
      }
    } else {
      return NextResponse.json({ error: 'No items provided for order.' }, { status: 400 });
    }

    if (calculatedTotal <= 0) {
      return NextResponse.json({ error: 'Invalid order total amount.' }, { status: 400 });
    }

    // Coupon verification
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;

    if (couponCode && typeof couponCode === 'string') {
      const cleanCode = couponCode.trim().toUpperCase();
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .maybeSingle();

      if (coupon) {
        const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
        const minMet = !coupon.min_order_value || calculatedTotal >= Number(coupon.min_order_value);

        if (!isExpired && minMet) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = Math.round((calculatedTotal * Number(coupon.discount_value)) / 100);
          } else {
            discountAmount = Math.min(calculatedTotal, Number(coupon.discount_value));
          }
          appliedCouponCode = coupon.code;

          // Increment coupon usage count
          await supabase
            .from('coupons')
            .update({ usage_count: (coupon.usage_count || 0) + 1 })
            .eq('id', coupon.id);
        }
      }
    }

    const stateStr = String(shippingAddress?.state || '').trim().toLowerCase();
    const isKerala = stateStr === 'kerala';
    const deliveryFee = isKerala ? 0 : 50;
    const finalTotal = Math.max(1, calculatedTotal - discountAmount + deliveryFee);

    // Unique readable order reference
    const orderNumber = `ZR-${Date.now().toString().slice(-6)}-${Math.floor(
      Math.random() * 899 + 100
    )}`;

    const paymentMethodClean = 'online';
    const paymentStatus = 'pending';

    // Insert order in database (live data on admin dashboard)
    const { data: savedOrder, error: orderErr } = await supabase
      .from('orders')
      .insert([
        {
          order_number: orderNumber,
          user_id: user?.id || null,
          customer_name: customer.fullName.trim(),
          customer_email: customer.email.trim().toLowerCase(),
          customer_phone: customer.phone || shippingAddress?.phone || null,
          shipping_address: shippingAddress || {},
          total_amount: finalTotal,
          currency: 'INR',
          payment_method: paymentMethodClean,
          payment_status: paymentStatus,
          order_status: 'placed',
          coupon_code: appliedCouponCode,
          discount_amount: discountAmount,
          notes: notes || null,
        },
      ])
      .select()
      .single();

    if (orderErr) {
      console.error('Error inserting order in database:', orderErr);
      return NextResponse.json(
        { error: 'Failed to record order. Please try again.' },
        { status: 500 }
      );
    }

    // Insert items in order_items table
    if (savedOrder?.id && orderItemsToInsert.length > 0) {
      const itemsWithOrderId = orderItemsToInsert.map((item) => ({
        ...item,
        order_id: savedOrder.id,
      }));
      await supabase.from('order_items').insert(itemsWithOrderId);
    }

    // Send confirmation emails in background (Brevo)
    const emailPayload = {
      orderNumber,
      customerName: customer.fullName.trim(),
      customerEmail: customer.email.trim().toLowerCase(),
      customerPhone: customer.phone || shippingAddress?.phone || null,
      shippingAddress,
      items: emailItems,
      subtotal: calculatedTotal,
      discountAmount,
      totalAmount: finalTotal,
      paymentMethod: paymentMethodClean,
      notes,
    };

    // Asynchronously send without blocking response
    Promise.all([
      sendOrderConfirmationEmail(emailPayload),
      sendAdminNewOrderEmail(emailPayload),
    ]).catch((emailErr) => {
      console.error('Background order email delivery error:', emailErr);
    });

    return NextResponse.json({
      success: true,
      orderId: savedOrder.id,
      orderNumber,
      totalAmount: finalTotal,
      paymentMethod: paymentMethodClean,
    });
  } catch (err: any) {
    console.error('Checkout API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to complete order checkout' },
      { status: 500 }
    );
  }
}
