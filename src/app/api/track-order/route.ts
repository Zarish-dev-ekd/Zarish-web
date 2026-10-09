import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber') || searchParams.get('order');

    if (!orderNumber || !orderNumber.trim()) {
      return NextResponse.json(
        { error: 'Order number is required.' },
        { status: 400 }
      );
    }

    const cleanOrderNumber = orderNumber.trim();
    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .ilike('order_number', cleanOrderNumber)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found. Please verify the order number.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    console.error('Track order API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to lookup order' },
      { status: 500 }
    );
  }
}
