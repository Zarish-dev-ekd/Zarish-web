import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  DEFAULT_SHIPPING_SENDER_INFO,
  type ShippingSenderInfo,
} from '@/lib/shipping-sender';
import { isAdminUser } from '@/lib/auth';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('store_policies')
      .select('content')
      .eq('slug', 'shipping-sender-settings')
      .maybeSingle();

    let info: ShippingSenderInfo = DEFAULT_SHIPPING_SENDER_INFO;
    if (data?.content) {
      const parsed =
        typeof data.content === 'string'
          ? JSON.parse(data.content)
          : data.content;
      if (parsed && typeof parsed === 'object') {
        info = {
          storeName: parsed.storeName || DEFAULT_SHIPPING_SENDER_INFO.storeName,
          address: parsed.address || DEFAULT_SHIPPING_SENDER_INFO.address,
          customerId:
            parsed.customerId !== undefined
              ? parsed.customerId
              : DEFAULT_SHIPPING_SENDER_INFO.customerId,
          accountInfo:
            parsed.accountInfo !== undefined
              ? parsed.accountInfo
              : DEFAULT_SHIPPING_SENDER_INFO.accountInfo,
          phone: parsed.phone || DEFAULT_SHIPPING_SENDER_INFO.phone,
        };
      }
    }

    return NextResponse.json({
      success: true,
      senderInfo: info,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      senderInfo: DEFAULT_SHIPPING_SENDER_INFO,
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
    const senderInfo: ShippingSenderInfo = body.senderInfo || body;

    if (!senderInfo || typeof senderInfo !== 'object') {
      return NextResponse.json(
        { error: 'Invalid shipping sender information format.' },
        { status: 400 }
      );
    }

    const cleanPayload: ShippingSenderInfo = {
      storeName: (senderInfo.storeName || DEFAULT_SHIPPING_SENDER_INFO.storeName).trim(),
      address: (senderInfo.address || DEFAULT_SHIPPING_SENDER_INFO.address).trim(),
      customerId: (senderInfo.customerId || '').trim(),
      accountInfo: (senderInfo.accountInfo || '').trim(),
      phone: (senderInfo.phone || DEFAULT_SHIPPING_SENDER_INFO.phone).trim(),
    };

    const supabase = createAdminClient();

    // Save to store_policies table (JSONB storage)
    const { error: policyErr } = await supabase
      .from('store_policies')
      .upsert(
        {
          slug: 'shipping-sender-settings',
          title: 'Shipping Label Sender Address and Account Information',
          content: cleanPayload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      );

    if (policyErr) {
      console.error('Error saving shipping sender settings:', policyErr);
      return NextResponse.json(
        { error: policyErr.message || 'Failed to save shipping sender settings.' },
        { status: 500 }
      );
    }

    revalidatePath('/admin/orders');
    revalidatePath('/admin/settings');

    return NextResponse.json({
      success: true,
      senderInfo: cleanPayload,
    });
  } catch (err: any) {
    console.error('Shipping sender settings POST error:', err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          'Internal server error while saving shipping sender settings.',
      },
      { status: 500 }
    );
  }
}
