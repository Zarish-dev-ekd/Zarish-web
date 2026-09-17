import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createRazorpayOrder, getRazorpayKeyId } from '@/lib/razorpay';

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
      couponCode = null,
      notes = null,
    } = body;

    // Validate customer contact
    if (!customer?.email || !customer?.fullName) {
      return NextResponse.json(
        { error: 'Customer name and email are required.' },
        { status: 400 }
      );
    }

    // Validate shipping address
    if (!shippingAddress?.addressLine1 || !shippingAddress?.city || !shippingAddress?.postalCode) {
      return NextResponse.json(
        { error: 'Complete shipping address (address, city, pincode) is required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user is authenticated
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

    // Case 1: Single direct purchase (from Product detail page)
    if (productId) {
      const { data: product, error: prodErr } = await supabase
        .from('products')
        .select(`*, images:product_images(*)`)
        .eq('id', productId)
        .single();

      if (prodErr || !product) {
        return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
      }

      // Security: Validate price strictly from the database product record
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
    } else if (Array.isArray(items) && items.length > 0) {
      // Case 2: Multi-item cart purchase
      for (const it of items) {
        const { data: prod } = await supabase
          .from('products')
          .select(`*, images:product_images(*)`)
          .eq('id', it.productId)
          .single();

        if (prod) {
          // Security: Validate price strictly from the database product record
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
        }
      }
    } else {
      return NextResponse.json({ error: 'No items provided for purchase.' }, { status: 400 });
    }

    if (calculatedTotal <= 0) {
      return NextResponse.json({ error: 'Invalid order amount.' }, { status: 400 });
    }

    // Process coupon code if provided (Strict backend verification)
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
        }
      }
    }

    const stateStr = String(shippingAddress?.state || '').trim().toLowerCase();
    const isKerala = stateStr === 'kerala';
    const deliveryFee = isKerala ? 0 : 50;
    const finalPayableTotal = Math.max(1, calculatedTotal - discountAmount + deliveryFee);

    // Generate readable order number: ZR-XXXXXX
    const orderNumber = `ZR-${Date.now().toString().slice(-6)}-${Math.floor(
      Math.random() * 899 + 100
    )}`;

    // Create authoritative order on Razorpay servers (Amount in paise: ₹1 = 100 paise)
    const amountInPaise = Math.round(finalPayableTotal * 100);
    const rzpOrder = await createRazorpayOrder({
      amountInPaise,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        customerEmail: customer.email,
        customerName: customer.fullName,
        orderNumber,
        couponCode: appliedCouponCode || 'none',
      },
    });

    // Save pending order record to Supabase
    const { data: savedOrder, error: orderErr } = await supabase
      .from('orders')
      .insert([
        {
          order_number: orderNumber,
          user_id: user?.id || null,
          customer_name: customer.fullName.trim(),
          customer_email: customer.email.trim().toLowerCase(),
          customer_phone: customer.phone || shippingAddress?.phone || null,
          shipping_address: shippingAddress,
          total_amount: finalPayableTotal,
          currency: 'INR',
          payment_method: 'razorpay',
          payment_status: 'pending',
          razorpay_order_id: rzpOrder.id,
          order_status: 'placed',
          coupon_code: appliedCouponCode,
          discount_amount: discountAmount,
          notes: notes || null,
        },
      ])
      .select()
      .single();

    if (orderErr || !savedOrder) {
      console.error('Error saving order in database:', orderErr);
      return NextResponse.json(
        { error: 'Failed to record order in database.' },
        { status: 500 }
      );
    }

    // Insert order items
    if (orderItemsToInsert.length > 0) {
      const itemsWithOrderId = orderItemsToInsert.map((item) => ({
        ...item,
        order_id: savedOrder.id,
      }));
      const { error: itemsErr } = await supabase.from('order_items').insert(itemsWithOrderId);
      if (itemsErr) {
        console.error('Error inserting order items:', itemsErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: savedOrder.id,
      orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: getRazorpayKeyId(),
      subtotal: calculatedTotal,
      discountAmount,
      finalAmount: finalPayableTotal,
      couponCode: appliedCouponCode,
    });
  } catch (err: any) {
    console.error('Error creating Razorpay order:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to initiate Razorpay transaction' },
      { status: 500 }
    );
  }
}
