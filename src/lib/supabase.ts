/* ============================================================
   ZARISH — Supabase Server Query Functions
   Safe data loaders for Server Components with error shielding.
   ============================================================ */

import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import type {
  Announcement,
  NavigationItem,
  HeroSlide,
  Benefit,
  Category,
  Size,
  Product,
  ProductColor,
  SiteSettings,
  FooterGroup,
  BrandStoryData,
} from '@/lib/types';
import fs from 'fs';
import path from 'path';

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

export async function getActiveHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data) return [];
    return data as HeroSlide[];
  } catch {
    return [];
  }
}

export async function getActiveHeroSlide(): Promise<HeroSlide | null> {
  try {
    const slides = await getActiveHeroSlides();
    return slides.length > 0 ? slides[0] : null;
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

export async function getNewArrivalProducts(limit = 24): Promise<Product[]> {
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
      .eq('is_new_arrival', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      // Fallback: If no products specifically marked, return latest arrivals
      return getLatestProducts(limit);
    }
    return data as Product[];
  } catch {
    return [];
  }
}

export async function getProductsPaginated(
  offset = 0,
  limit = 10
): Promise<{ products: Product[]; total: number; hasMore: boolean }> {
  try {
    const supabase = await createClient();
    const { data, count, error } = await supabase
      .from('products')
      .select(
        `
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*, size:sizes(*))
      `,
        { count: 'exact' }
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data) {
      return { products: [], total: 0, hasMore: false };
    }

    const total = count ?? data.length;
    const hasMore = offset + data.length < total;
    return {
      products: data as Product[],
      total,
      hasMore,
    };
  } catch {
    return { products: [], total: 0, hasMore: false };
  }
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
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
});

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

export async function getAllColors(): Promise<ProductColor[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('colors')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!data) return [];
    return data as ProductColor[];
  } catch {
    return [];
  }
}

export async function getBrandStory(): Promise<BrandStoryData | null> {
  // 1. Try Supabase database first
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('brand_story')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return data as BrandStoryData;
    }
  } catch {
    // Ignore error, fallback to local storage
  }

  // 2. Fallback to local data file
  try {
    const dataFile = path.join(process.cwd(), 'src', 'data', 'brand-story.json');
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile, 'utf-8');
      return JSON.parse(raw) as BrandStoryData;
    }
  } catch {
    // Ignore
  }

  // 3. Built-in default
  return {
    id: 'brand-story-default',
    heading: 'Dear Zarish Family,',
    eyebrow: 'A NOTE FROM OUR FOUNDER',
    paragraphs: [
      'Zarish started as a small dream my husband and I shared. While building it, we were also learning to be parents, and our little girl was growing alongside us. There were days we wished we could give her more of our time, but she quietly waited, adjusted, and grew with us. Looking back, I realise she didn’t just grow up alongside Zarish—she grew up with it.',
      'I’m forever grateful to my husband for being my strength through every high and low, believing in me when I doubted myself, and always encouraging me to keep going. And to our Zarish family, thank you for being part of this journey. Every order, kind message, share, recommendation, and every person who believed in us has meant more than you know.',
      'We started Zarish with a dream, and today, we carry it with gratitude. Every order reminds us that something we built with love has found a place in someone else’s life. As we continue to grow, we’re grateful to have you with us. Thank you for being a part of our Zarish story.',
    ],
    sign_off: 'With love,',
    founder_name: 'Nehala Mufeed',
    founder_role: 'Founder, Zarish',
    image_url: '/zarish-luxury-card.webp',
    image_alt: 'ZARISH by Nehala Mufeed',
    cta_text: 'Shop now',
    cta_url: '/products',
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}


