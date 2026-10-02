import type { ProductBadge, BadgeStyle, Product } from '@/lib/types';

export const DEFAULT_PRODUCT_BADGES: ProductBadge[] = [
  {
    id: 'badge-new-corner',
    name: 'NEW (Yellow Corner Ribbon)',
    text: 'NEW',
    style: 'corner_ribbon',
    bg_color: '#FFD200',
    text_color: '#000000',
    is_active: true,
    display_order: 1,
  },
  {
    id: 'badge-best-corner',
    name: 'BEST (Yellow Corner Ribbon)',
    text: 'BEST',
    style: 'corner_ribbon',
    bg_color: '#FFD200',
    text_color: '#000000',
    is_active: true,
    display_order: 2,
  },
  {
    id: 'badge-sale-corner',
    name: 'SALE (Yellow Corner Ribbon)',
    text: 'SALE',
    style: 'corner_ribbon',
    bg_color: '#FFD200',
    text_color: '#000000',
    is_active: true,
    display_order: 3,
  },
  {
    id: 'badge-bestseller-gold',
    name: 'BESTSELLER (Gold Corner Ribbon)',
    text: 'BESTSELLER',
    style: 'corner_ribbon',
    bg_color: '#D4AF37',
    text_color: '#FFFFFF',
    is_active: true,
    display_order: 4,
  },
  {
    id: 'badge-50off-corner',
    name: '50% OFF (Yellow Corner Ribbon)',
    text: '50% OFF',
    style: 'corner_ribbon',
    bg_color: '#FFD200',
    text_color: '#000000',
    is_active: true,
    display_order: 5,
  },
  {
    id: 'badge-emerald-corner',
    name: 'NEW ARRIVAL (Emerald Ribbon)',
    text: 'NEW',
    style: 'corner_ribbon',
    bg_color: '#0E7064',
    text_color: '#FFFFFF',
    is_active: true,
    display_order: 6,
  },
  {
    id: 'badge-special-corner',
    name: 'SPECIAL OFFER (Red Ribbon)',
    text: 'SPECIAL',
    style: 'corner_ribbon',
    bg_color: '#C44D4D',
    text_color: '#FFFFFF',
    is_active: true,
    display_order: 7,
  },
];


const LOCAL_STORAGE_KEY = 'zarish_custom_badges_v2';

/**
 * Fetch badges from Supabase product_badges table.
 * Falls back to default badges + local custom badges if table is not yet created.
 */
export async function getProductBadges(supabase: any): Promise<ProductBadge[]> {
  try {
    const { data, error } = await supabase
      .from('product_badges')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Could not query product_badges table:', err);
  }

  // Fallback: Check localStorage if in browser
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge unique by id
          const ids = new Set(parsed.map((p) => p.id));
          const defaults = DEFAULT_PRODUCT_BADGES.filter((d) => !ids.has(d.id));
          return [...parsed, ...defaults];
        }
      }
    } catch {}
  }

  return DEFAULT_PRODUCT_BADGES;
}

/**
 * Save or update a badge
 */
export async function saveProductBadge(supabase: any, badge: Partial<ProductBadge>): Promise<ProductBadge> {
  const badgeToSave: ProductBadge = {
    id: badge.id || `badge-${Date.now()}`,
    name: badge.name || 'Custom Badge',
    text: badge.text || 'FEATURED',
    style: badge.style || 'corner_ribbon',
    bg_color: badge.bg_color || '#D4AF37',
    text_color: badge.text_color || '#FFFFFF',
    is_active: badge.is_active ?? true,
    display_order: badge.display_order ?? 0,
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('product_badges')
      .upsert(badgeToSave)
      .select()
      .single();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn('Could not upsert into product_badges, saving to local fallback:', err);
  }

  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    try {
      const existing = await getProductBadges(supabase);
      const index = existing.findIndex((b) => b.id === badgeToSave.id);
      let updatedList = [...existing];
      if (index >= 0) {
        updatedList[index] = badgeToSave;
      } else {
        updatedList.unshift(badgeToSave);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch {}
  }

  return badgeToSave;
}

/**
 * Delete a badge
 */
export async function deleteProductBadge(supabase: any, badgeId: string): Promise<void> {
  try {
    await supabase.from('product_badges').delete().eq('id', badgeId);
  } catch (err) {
    console.warn('Could not delete from product_badges table:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: ProductBadge[] = JSON.parse(stored);
        const filtered = parsed.filter((b) => b.id !== badgeId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch {}
  }
}

/**
 * Extracts and resolves a badge object from a Product record
 */
export function getProductBadge(product: Partial<Product> | null | undefined): ProductBadge | null {
  if (!product) return null;
  if (product.badge) return product.badge;

  // 1. Check if badge is embedded in tags as JSON
  if (product.tags && Array.isArray(product.tags)) {
    const badgeDataTag = product.tags.find((t) => t.startsWith('badge_data:'));
    if (badgeDataTag) {
      try {
        const parsed = JSON.parse(badgeDataTag.slice('badge_data:'.length));
        if (parsed && parsed.text && parsed.style) {
          return parsed as ProductBadge;
        }
      } catch {}
    }

    const badgeIdTag = product.tags.find((t) => t.startsWith('badge_id:'));
    if (badgeIdTag) {
      const id = badgeIdTag.slice('badge_id:'.length);
      const found = DEFAULT_PRODUCT_BADGES.find((b) => b.id === id);
      if (found) return found;
    }
  }

  // 2. Check if badge_id matches one of the defaults
  if (product.badge_id) {
    const found = DEFAULT_PRODUCT_BADGES.find((b) => b.id === product.badge_id);
    if (found) return found;
  }

  return null;
}
