import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

const LOCAL_FILE = path.join(process.cwd(), 'src', 'data', 'checkout-settings.json');

function getLocalConfig(): { enable_coupons: boolean } {
  try {
    if (fs.existsSync(LOCAL_FILE)) {
      const raw = fs.readFileSync(LOCAL_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (typeof data.enable_coupons === 'boolean') {
        return { enable_coupons: data.enable_coupons };
      }
    }
  } catch {
    // ignore
  }
  return { enable_coupons: true };
}

function saveLocalConfig(config: { enable_coupons: boolean }) {
  try {
    const dir = path.dirname(LOCAL_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      LOCAL_FILE,
      JSON.stringify({ ...config, updated_at: new Date().toISOString() }, null, 2),
      'utf-8'
    );
  } catch (e) {
    console.warn('Failed to write local checkout-settings.json:', e);
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('store_policies')
      .select('content')
      .eq('slug', 'checkout-settings')
      .maybeSingle();

    if (data?.content) {
      const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      if (typeof parsed?.enable_coupons === 'boolean') {
        return NextResponse.json({
          success: true,
          enable_coupons: parsed.enable_coupons,
        });
      }
    }

    const local = getLocalConfig();
    return NextResponse.json({
      success: true,
      enable_coupons: local.enable_coupons,
    });
  } catch (err: any) {
    const local = getLocalConfig();
    return NextResponse.json({
      success: true,
      enable_coupons: local.enable_coupons,
      warning: err?.message,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const enable_coupons = Boolean(body.enable_coupons);

    // Save locally first for instant consistency
    saveLocalConfig({ enable_coupons });

    try {
      const supabase = createAdminClient();
      await supabase
        .from('store_policies')
        .upsert(
          {
            slug: 'checkout-settings',
            title: 'Checkout Configuration Settings',
            content: { enable_coupons },
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'slug' }
        );
    } catch (dbErr) {
      console.warn('Could not save checkout settings to Supabase, local file saved:', dbErr);
    }

    revalidatePath('/checkout');
    revalidatePath('/admin/coupons');
    revalidatePath('/admin/settings');

    return NextResponse.json({
      success: true,
      enable_coupons,
    });
  } catch (err: any) {
    console.error('Checkout settings POST error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error while saving checkout settings.' },
      { status: 500 }
    );
  }
}
