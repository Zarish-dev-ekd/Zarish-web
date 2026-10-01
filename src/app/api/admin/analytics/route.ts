import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { isAdminUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // 0. Defense in Depth: Verify Admin Privileges
    const userClient = await createClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user || !isAdminUser(user)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin privileges required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'all'; // 'all', '30d', '7d', 'today'

    const supabase = createAdminClient();

    // 1. Determine date filter threshold
    let dateThreshold: string | null = null;
    const now = new Date();
    if (range === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateThreshold = startOfDay.toISOString();
    } else if (range === '7d') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateThreshold = past7.toISOString();
    } else if (range === '30d') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateThreshold = past30.toISOString();
    }

    // 2. Fetch orders with their line items
    let ordersQuery = supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });

    if (dateThreshold) {
      ordersQuery = ordersQuery.gte('created_at', dateThreshold);
    }

    const { data: orders, error: ordersErr } = await ordersQuery;
    if (ordersErr) throw ordersErr;

    // 3. Fetch products with categories for metadata
    const { data: products } = await supabase
      .from('products')
      .select('id, name, slug, price, stock_quantity, category_id, category:categories(id, name, slug), images:product_images(*)');

    const productsMap = new Map<string, any>();
    if (products) {
      for (const p of products) {
        productsMap.set(p.id, p);
      }
    }

    // 4. Calculate Analytics Metrics
    const validOrders = (orders || []).filter((o: any) => o.order_status !== 'cancelled');

    let totalRevenue = 0;
    let totalUnitsSold = 0;

    // Product Aggregations
    const productStatsMap = new Map<
      string,
      {
        id: string;
        name: string;
        image_url: string;
        category_name: string;
        units_sold: number;
        total_revenue: number;
        current_stock: number;
        price: number;
      }
    >();

    // Category Aggregations
    const categoryStatsMap = new Map<
      string,
      {
        id: string;
        name: string;
        units_sold: number;
        total_revenue: number;
        order_count: number;
      }
    >();

    // Customer Aggregations
    const customerStatsMap = new Map<
      string,
      {
        name: string;
        email: string;
        phone: string;
        orders_count: number;
        total_spent: number;
        last_order_date: string;
      }
    >();

    for (const order of validOrders) {
      const orderTotal = Number(order.total_amount) || 0;
      totalRevenue += orderTotal;

      // Customer Tracking (group by email if exists, otherwise phone or name)
      const customerKey = (order.customer_email || order.customer_phone || order.customer_name || 'Guest')
        .trim()
        .toLowerCase();

      if (!customerStatsMap.has(customerKey)) {
        customerStatsMap.set(customerKey, {
          name: order.customer_name || 'Valued Customer',
          email: order.customer_email || '',
          phone: order.customer_phone || '',
          orders_count: 0,
          total_spent: 0,
          last_order_date: order.created_at,
        });
      }
      const cust = customerStatsMap.get(customerKey)!;
      cust.orders_count += 1;
      cust.total_spent += orderTotal;
      if (new Date(order.created_at) > new Date(cust.last_order_date)) {
        cust.last_order_date = order.created_at;
      }

      // Order Items Tracking
      const items = Array.isArray(order.items) ? order.items : [];
      const orderCategoriesSeen = new Set<string>();

      for (const item of items) {
        const q = Math.max(1, Number(item.quantity) || 1);
        const itemPrice = Number(item.unit_price) || (Number(item.total_price) / q) || 0;
        const itemTotal = Number(item.total_price) || itemPrice * q;
        totalUnitsSold += q;

        // Find linked product if available
        const prod = item.product_id ? productsMap.get(item.product_id) : null;
        const prodId = item.product_id || item.product_name || 'Unknown';
        const prodName = item.product_name || prod?.name || 'Standard Item';
        const prodImg =
          item.image_url ||
          prod?.images?.find((img: any) => img.role === 'primary')?.secure_url ||
          prod?.images?.[0]?.secure_url ||
          '/zarish-luxury-card.webp';
        const catName = prod?.category?.name || 'General';
        const currentStock = prod?.stock_quantity ?? 0;

        if (!productStatsMap.has(prodId)) {
          productStatsMap.set(prodId, {
            id: prodId,
            name: prodName,
            image_url: prodImg,
            category_name: catName,
            units_sold: 0,
            total_revenue: 0,
            current_stock: currentStock,
            price: itemPrice || Number(prod?.price) || 0,
          });
        }
        const pStat = productStatsMap.get(prodId)!;
        pStat.units_sold += q;
        pStat.total_revenue += itemTotal;

        // Category Tracking
        const catKey = catName.trim() || 'General';
        if (!categoryStatsMap.has(catKey)) {
          categoryStatsMap.set(catKey, {
            id: prod?.category_id || catKey,
            name: catKey,
            units_sold: 0,
            total_revenue: 0,
            order_count: 0,
          });
        }
        const cStat = categoryStatsMap.get(catKey)!;
        cStat.units_sold += q;
        cStat.total_revenue += itemTotal;
        if (!orderCategoriesSeen.has(catKey)) {
          cStat.order_count += 1;
          orderCategoriesSeen.add(catKey);
        }
      }
    }

    // Top Products sorted by units sold, then revenue
    const topProducts = Array.from(productStatsMap.values()).sort(
      (a, b) => b.units_sold - a.units_sold || b.total_revenue - a.total_revenue
    );

    // Top Categories sorted by units sold
    const topCategories = Array.from(categoryStatsMap.values())
      .map((cat) => ({
        ...cat,
        percentage: totalUnitsSold > 0 ? Math.round((cat.units_sold / totalUnitsSold) * 100) : 0,
      }))
      .sort((a, b) => b.units_sold - a.units_sold);

    // Most Active Buyers sorted by total orders count, then total spend
    const topBuyers = Array.from(customerStatsMap.values())
      .map((cust) => ({
        ...cust,
        aov: cust.orders_count > 0 ? Math.round(cust.total_spent / cust.orders_count) : 0,
        tier:
          cust.orders_count >= 3
            ? 'VIP Buyer'
            : cust.orders_count === 2
            ? 'Repeat Buyer'
            : 'New Buyer',
      }))
      .sort((a, b) => b.orders_count - a.orders_count || b.total_spent - a.total_spent);

    const totalOrdersCount = validOrders.length;
    const aov = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
    const uniqueCustomersCount = customerStatsMap.size;
    const repeatBuyersCount = Array.from(customerStatsMap.values()).filter(
      (c) => c.orders_count >= 2
    ).length;
    const repeatRate =
      uniqueCustomersCount > 0 ? Math.round((repeatBuyersCount / uniqueCustomersCount) * 100) : 0;

    return NextResponse.json(
      {
        success: true,
        summary: {
          totalRevenue,
          totalOrders: totalOrdersCount,
          totalUnitsSold,
          aov,
          uniqueCustomers: uniqueCustomersCount,
          repeatRate,
        },
        topProducts,
        topCategories,
        topBuyers,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (err: any) {
    console.error('Analytics API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to compute analytics' },
      { status: 500 }
    );
  }
}
