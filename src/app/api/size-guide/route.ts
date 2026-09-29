import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { DEFAULT_SIZE_GUIDE_IMAGE } from '@/lib/sizeChart';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('store_policies')
      .select('content')
      .eq('slug', 'size-guide')
      .maybeSingle();

    const imageUrl = data?.content?.image_url || DEFAULT_SIZE_GUIDE_IMAGE;
    const showOverlay = data?.content?.show_overlay ?? true;

    return NextResponse.json({
      success: true,
      imageUrl,
      showOverlay,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      imageUrl: DEFAULT_SIZE_GUIDE_IMAGE,
      showOverlay: true,
      warning: err?.message,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const imageUrl = (body.imageUrl || body.image_url || DEFAULT_SIZE_GUIDE_IMAGE).trim();
    const showOverlay = typeof body.showOverlay === 'boolean' ? body.showOverlay : (body.show_overlay ?? true);

    const supabase = createAdminClient();

    // 1. Save to store_policies (JSONB storage)
    const { error: policyErr } = await supabase
      .from('store_policies')
      .upsert(
        {
          slug: 'size-guide',
          title: 'Size & Fit Guide Settings',
          content: {
            image_url: imageUrl,
            show_overlay: showOverlay,
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      );

    if (policyErr) {
      console.error('Error saving size-guide policy:', policyErr);
    }

    // 2. Also try saving to site_settings if column exists
    try {
      const { data: settings } = await supabase.from('site_settings').select('id').limit(1).maybeSingle();
      if (settings?.id) {
        await supabase
          .from('site_settings')
          .update({
            size_guide_image_url: imageUrl,
            size_guide_show_overlay: showOverlay,
          })
          .eq('id', settings.id);
      }
    } catch {
      // Column may not exist in site_settings yet, store_policies handles it
    }

    // 3. Revalidate storefront product and admin pages
    try {
      revalidatePath('/products');
      revalidatePath('/admin/sizes');
    } catch {
      // Ignore cache revalidation errors
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      showOverlay,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update size guide graphic' },
      { status: 500 }
    );
  }
}
