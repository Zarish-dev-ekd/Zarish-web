/* ============================================================
   ZARISH — Supabase Server Query Functions
   Safe data loaders for Server Components with error shielding.
   ============================================================ */

import { createClient } from '@/utils/supabase/server';
import type {
  Announcement,
  NavigationItem,
  HeroSlide,
  Benefit,
  Category,
  Size,
  Product,
  SiteSettings,
  FooterGroup,
} from '@/lib/types';

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as SiteSettings;
  } catch {
    return null;
  }
}

export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data) return [];
    return data as Announcement[];
  } catch {
    return [];
  }
}

export async function getNavigationItems(): Promise<NavigationItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('navigation_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data) return [];
    return data as NavigationItem[];
  } catch {
    return [];
  }
}

export async function getActiveHeroSlide(): Promise<HeroSlide | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as HeroSlide;
  } catch {
    return null;
  }
}

export async function getBenefits(): Promise<Benefit[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('benefits')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data) return [];
    return data as Benefit[];
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data) return [];
    return data as Category[];
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;
    return data as Category;
  } catch {
    return null;
  }
}

export async function getSizes(): Promise<Size[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sizes')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data) return [];
    return data as Size[];
  } catch {
    return [];
  }
}

export async function getLatestProducts(limit = 8): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*, size:sizes(*))
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as Product[];
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*, size:sizes(*))
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return null;
    return data as Product;
  } catch {
    return null;
  }
}

export async function getRelatedProducts(
  categoryId: string | null,
  currentProductId: string,
  limit = 4
): Promise<Product[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*, size:sizes(*))
      `)
      .eq('is_active', true)
      .neq('id', currentProductId)
      .limit(limit);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as Product[];
  } catch {
    return [];
  }
}

export async function getFilteredProducts(options?: {
  categorySlug?: string;
  sizeSlug?: string;
  onSale?: boolean;
  sort?: string;
  limit?: number;
}): Promise<Product[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*, size:sizes(*))
      `)
      .eq('is_active', true);

    if (options?.onSale) {
      query = query.eq('is_on_sale', true);
    }

    if (options?.sort === 'price-low') {
      query = query.order('price', { ascending: true });
    } else if (options?.sort === 'price-high') {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    let filtered = data as Product[];

    if (options?.categorySlug) {
      filtered = filtered.filter((p) => p.category?.slug === options.categorySlug);
    }

    if (options?.sizeSlug) {
      filtered = filtered.filter((p) =>
        p.variants?.some((v) => v.size?.slug === options.sizeSlug)
      );
    }

    return filtered;
  } catch {
    return [];
  }
}

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  if (!searchTerm.trim()) return [];
  try {
    const supabase = await createClient();
    const term = `%${searchTerm.trim()}%`;
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*, size:sizes(*))
      `)
      .eq('is_active', true)
      .ilike('name', term)
      .limit(20);

    if (error || !data) return [];
    return data as Product[];
  } catch {
    return [];
  }
}
