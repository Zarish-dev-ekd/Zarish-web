import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { DEFAULT_DELIVERY_CONFIG, type DeliveryConfig } from '@/lib/delivery';
import { isAdminUser } from '@/lib/auth';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('store_policies')
      .select('content')
      .eq('slug', 'delivery-settings')
      .maybeSingle();

    let config: DeliveryConfig = DEFAULT_DELIVERY_CONFIG;
    if (data?.content) {
      const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      if (Array.isArray(parsed?.kerala) && Array.isArray(parsed?.otherStates)) {
        config = parsed;
      }
    }

    return NextResponse.json({
      success: true,
      config,
      kerala: config.kerala,
      otherStates: config.otherStates,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      config: DEFAULT_DELIVERY_CONFIG,
      kerala: DEFAULT_DELIVERY_CONFIG.kerala,
      otherStates: DEFAULT_DELIVERY_CONFIG.otherStates,
      warning: err?.message,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const config: DeliveryConfig = body.config || body;

    if (!config || !Array.isArray(config.kerala) || !Array.isArray(config.otherStates)) {
      return NextResponse.json(
        { error: 'Invalid delivery configuration format.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Save to store_policies table (JSONB storage)
    const { error: policyErr } = await supabase
      .from('store_policies')
      .upsert(
        {
          slug: 'delivery-settings',
          title: 'Courier Delivery Methods and Shipping Rates',
          content: config,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      );

    if (policyErr) {
      console.error('Error saving delivery settings:', policyErr);
      return NextResponse.json(
        { error: policyErr.message || 'Failed to save delivery settings.' },
        { status: 500 }
      );
    }

    revalidatePath('/checkout');
    revalidatePath('/admin/settings');

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (err: any) {
    console.error('Delivery settings POST error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error while saving delivery settings.' },
      { status: 500 }
    );
  }
}
