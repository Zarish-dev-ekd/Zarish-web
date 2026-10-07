import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { isAdminUser } from '@/lib/auth';
import { DEFAULT_STOCK_BADGE_CONFIG, type StockBadgeConfig } from '@/lib/stock-badge-settings';
import fs from 'fs';
import path from 'path';

const LOCAL_FILE = path.join(process.cwd(), 'src', 'data', 'stock-badge-settings.json');

function getLocalConfigFile(): StockBadgeConfig {
  try {
    if (fs.existsSync(LOCAL_FILE)) {
      const raw = fs.readFileSync(LOCAL_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        enable_low_stock_badge: typeof data.enable_low_stock_badge === 'boolean' ? data.enable_low_stock_badge : DEFAULT_STOCK_BADGE_CONFIG.enable_low_stock_badge,
        low_stock_threshold: Number(data.low_stock_threshold) || DEFAULT_STOCK_BADGE_CONFIG.low_stock_threshold,
        show_in_stock_badge: typeof data.show_in_stock_badge === 'boolean' ? data.show_in_stock_badge : DEFAULT_STOCK_BADGE_CONFIG.show_in_stock_badge,
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_STOCK_BADGE_CONFIG;
}

function saveLocalConfigFile(config: StockBadgeConfig) {
  try {
    const dir = path.dirname(LOCAL_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      LOCAL_FILE,
      JSON.stringify({ ...config, updated_at: new Date().toISOString() }, null, 2),
      'utf-8'
    );
  } catch (e) {
    console.warn('Failed to write local stock-badge-settings.json:', e);
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check site_settings first
    const { data: siteData } = await supabase
      .from('site_settings')
      .select('enable_low_stock_badge, low_stock_threshold, show_in_stock_badge')
      .limit(1)
      .maybeSingle();

    if (siteData && (siteData.enable_low_stock_badge !== null || siteData.low_stock_threshold !== null)) {
      return NextResponse.json({
        success: true,
        config: {
          enable_low_stock_badge: siteData.enable_low_stock_badge ?? DEFAULT_STOCK_BADGE_CONFIG.enable_low_stock_badge,
          low_stock_threshold: Number(siteData.low_stock_threshold) || DEFAULT_STOCK_BADGE_CONFIG.low_stock_threshold,
          show_in_stock_badge: siteData.show_in_stock_badge ?? DEFAULT_STOCK_BADGE_CONFIG.show_in_stock_badge,
        },
      });
    }

    // Fallback: check store_policies
    const { data: policyData } = await supabase
      .from('store_policies')
      .select('content')
      .eq('slug', 'stock-badge-settings')
      .maybeSingle();

    if (policyData?.content) {
      const parsed = typeof policyData.content === 'string' ? JSON.parse(policyData.content) : policyData.content;
      return NextResponse.json({
        success: true,
        config: {
          enable_low_stock_badge: parsed.enable_low_stock_badge ?? DEFAULT_STOCK_BADGE_CONFIG.enable_low_stock_badge,
          low_stock_threshold: Number(parsed.low_stock_threshold) || DEFAULT_STOCK_BADGE_CONFIG.low_stock_threshold,
          show_in_stock_badge: parsed.show_in_stock_badge ?? DEFAULT_STOCK_BADGE_CONFIG.show_in_stock_badge,
        },
      });
    }

    const local = getLocalConfigFile();
    return NextResponse.json({
      success: true,
      config: local,
    });
  } catch (err: any) {
    const local = getLocalConfigFile();
    return NextResponse.json({
      success: true,
      config: local,
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
    const config: StockBadgeConfig = {
      enable_low_stock_badge: typeof body.enable_low_stock_badge === 'boolean' ? body.enable_low_stock_badge : true,
      low_stock_threshold: Math.max(1, Math.min(100, Number(body.low_stock_threshold) || 3)),
      show_in_stock_badge: typeof body.show_in_stock_badge === 'boolean' ? body.show_in_stock_badge : false,
    };

    // Save locally first for instant consistency
    saveLocalConfigFile(config);

    try {
      const supabase = createAdminClient();
      
      // Update site_settings if row exists
      const { data: siteRow } = await supabase.from('site_settings').select('id').limit(1).maybeSingle();
      if (siteRow?.id) {
        await supabase
          .from('site_settings')
          .update({
            enable_low_stock_badge: config.enable_low_stock_badge,
            low_stock_threshold: config.low_stock_threshold,
            show_in_stock_badge: config.show_in_stock_badge,
            updated_at: new Date().toISOString(),
          })
          .eq('id', siteRow.id);
      }

      // Also persist to store_policies for fallback resilience
      await supabase
        .from('store_policies')
        .upsert(
          {
            slug: 'stock-badge-settings',
            title: 'Stock & Urgency Badge Settings',
            content: config,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'slug' }
        );
    } catch (dbErr) {
      console.warn('Could not save stock badge settings to Supabase, local file saved:', dbErr);
    }

    revalidatePath('/');
    revalidatePath('/shop-by-size');
    revalidatePath('/admin/settings');
    revalidatePath('/admin/badges');

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (err: any) {
    console.error('Stock badge settings POST error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error while saving stock badge settings.' },
      { status: 500 }
    );
  }
}
