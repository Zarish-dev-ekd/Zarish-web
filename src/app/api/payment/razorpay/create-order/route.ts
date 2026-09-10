import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createRazorpayOrder, getRazorpayKeyId } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, productId, quantity = 1, size = 'Standard', customer, shippingAddress } = body;

    if (!customer?.email || !customer?.fullName) {
      return NextResponse.json(
        { error: 'Customer name and email are required.' },
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

      const unitPrice = Number(product.price);
      const totalItemPrice = unitPrice * Math.max(1, Number(quantity));
      calculatedTotal += totalItemPrice;

      const primaryImg =
        product.images?.find((img: any) => img.role === 'primary')?.secure_url ||
        product.images?.[0]?.secure_url ||
        '';

      orderItemsToInsert.push({
        product_id: product.id,
        product_name: product.name,
        size: size || 'Standard',
        quantity: Math.max(1, Number(quantity)),
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

    // Generate readable order number: ZR-XXXXXX
    const orderNumber = `ZR-${Date.now().toString().slice(-6)}-${Math.floor(
      Math.random() * 899 + 100
    )}`;

    // Create order on Razorpay (Amount in paise: ₹1 = 100 paise)
    const amountInPaise = Math.round(calculatedTotal * 100);
    const rzpOrder = await createRazorpayOrder({
      amountInPaise,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        customerEmail: customer.email,
        customerName: customer.fullName,
      },
    });

    // Save order record to Supabase
    const { data: savedOrder, error: orderErr } = await supabase
      .from('orders')
      .insert([
        {
          order_number: orderNumber,
          user_id: user?.id || null,
          customer_name: customer.fullName.trim(),
          customer_email: customer.email.trim(),
          customer_phone: customer.phone || shippingAddress?.phone || null,
          shipping_address: shippingAddress || {},
          total_amount: calculatedTotal,
          currency: 'INR',
          payment_method: 'razorpay',
          payment_status: 'pending',
          razorpay_order_id: rzpOrder.id,
          order_status: 'placed',
        },
      ])
      .select()
      .single();

    if (orderErr) {
      console.error('Error saving order in database:', orderErr);
      // Still proceed if DB table is being created, returning the Razorpay parameters
    }

    // Insert order items if order was saved
    if (savedOrder?.id) {
      const itemsWithOrderId = orderItemsToInsert.map((item) => ({
        ...item,
        order_id: savedOrder.id,
      }));
      await supabase.from('order_items').insert(itemsWithOrderId);
    }

    return NextResponse.json({
      success: true,
      orderId: savedOrder?.id || null,
      orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: getRazorpayKeyId(),
      isSimulated: Boolean(rzpOrder.isSimulated),
    });
  } catch (err: any) {
    console.error('Error creating Razorpay order:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to initiate Razorpay transaction' },
      { status: 500 }
    );
  }
}
