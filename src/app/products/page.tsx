import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getFilteredProducts,
  getCategories,
  getSizes,
  getSiteSettings,
  getAnnouncements,
  getNavigationItems,
} from '@/lib/supabase';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import ProductSortSelect from '@/components/product/ProductSortSelect';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'All Garments | ZARISH by Nehala Mufeed',
  description: 'Explore the complete modest collection of abayas, dresses, and co-ords by ZARISH.',
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    size?: string;
    sort?: string;
    sale?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category;
  const sizeSlug = resolvedParams.size;
  const sort = resolvedParams.sort || 'newest';
  const onSale = resolvedParams.sale === 'true';

  const [products, categories, sizes, settings, announcements, navigationItems] = await Promise.all([
    getFilteredProducts({
      categorySlug,
      sizeSlug,
      onSale,
      sort,
    }),
    getCategories(),
    getSizes(),
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
  ]);

  const activeCategory = categories.find((c) => c.slug === categorySlug);
  const activeSize = sizes.find((s) => s.slug === sizeSlug);

  // Helper to build URLs preserving or toggling parameters
  const buildUrl = (overrides: {
    category?: string | null;
    size?: string | null;
    sort?: string | null;
    sale?: boolean | null;
  }) => {
    const params = new URLSearchParams();

    const cat = overrides.category !== undefined ? overrides.category : categorySlug;
    const sz = overrides.size !== undefined ? overrides.size : sizeSlug;
    const st = overrides.sort !== undefined ? overrides.sort : sort;
    const sl = overrides.sale !== undefined ? overrides.sale : onSale;

    if (cat) params.set('category', cat);
    if (sz) params.set('size', sz);
    if (sl) params.set('sale', 'true');
    if (st && st !== 'newest') params.set('sort', st);

    const str = params.toString();
    return str ? `/products?${str}` : '/products';
  };

  const hasActiveFilters = Boolean(categorySlug || sizeSlug || onSale || (sort && sort !== 'newest'));

  return (
    <>
      <AnnouncementBar announcements={announcements} />
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-8 pt-8 pb-20">
        {/* Page Editorial Heading */}
        <div className="text-center mb-8 md:mb-10">
          <span className="text-[11px] tracking-[0.2em] uppercase text-[#7B5B3A] font-semibold">
            {onSale ? 'SPECIAL OFFERS' : activeCategory ? 'CURATED COLLECTION' : 'EXPLORE SHOP'}
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#2C1D13] mt-1.5 mb-2">
            {onSale
              ? 'Sale & Special Offers'
              : activeCategory
              ? activeCategory.name
              : 'The Full Collection'}
          </h1>
          <p className="text-xs sm:text-sm text-[#8C7B6B] max-w-[580px] mx-auto leading-relaxed">
            {activeCategory?.description ||
              (onSale
                ? 'Discover limited-edition deals and timeless seasonal pieces at special pricing.'
                : 'Refined modest silhouettes crafted with premium fabrics for everyday elegance.')}
          </p>
        </div>

        {/* ── FILTER & SORT CONTROLS ── */}
        <div className="space-y-4 pb-6 border-b border-[#E2D5C7]">
          {/* 1. Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href={buildUrl({ category: null, sale: false })}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all whitespace-nowrap inline-flex items-center justify-center cursor-pointer ${
                !categorySlug && !onSale
                  ? 'bg-[#2C1D13] text-white border-[#2C1D13] shadow-xs'
                  : 'bg-white text-[#4A3728] border-[#E2D5C7] hover:border-[#2C1D13] hover:bg-[#FAF6F0]'
              }`}
            >
              All Pieces
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={buildUrl({ category: cat.slug, sale: false })}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all whitespace-nowrap inline-flex items-center justify-center cursor-pointer ${
                  categorySlug === cat.slug && !onSale
                    ? 'bg-[#2C1D13] text-white border-[#2C1D13] shadow-xs'
                    : 'bg-white text-[#4A3728] border-[#E2D5C7] hover:border-[#2C1D13] hover:bg-[#FAF6F0]'
                }`}
              >
                {cat.name}
              </Link>
            ))}

            <Link
              href={buildUrl({ category: null, sale: true })}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all whitespace-nowrap inline-flex items-center justify-center cursor-pointer ${
                onSale
                  ? 'bg-[#8B4E5A] text-white border-[#8B4E5A] shadow-xs'
                  : 'bg-white text-[#8B4E5A] border-[#8B4E5A]/40 hover:bg-[#FDF2F4]'
              }`}
            >
              Sale
            </Link>
          </div>

          {/* 2. Secondary Bar: Sizes + Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            {/* Size Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-[#7B5B3A] uppercase tracking-wider">Size:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {sizes.map((s) => {
                  const isSelected = sizeSlug === s.slug;
                  return (
                    <Link
                      key={s.id}
                      href={buildUrl({ size: isSelected ? null : s.slug })}
                      title={isSelected ? `Unselect size ${s.name}` : `Filter by size ${s.name}`}
                      className={`min-w-[32px] h-8 px-2 rounded-full text-xs font-semibold border transition-all inline-flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-[#884A48] text-white border-[#884A48] shadow-xs'
                          : 'bg-white text-[#2C1D13] border-[#E2D5C7] hover:border-[#884A48] hover:bg-[#FAF6F0]'
                      }`}
                    >
                      {s.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center self-start sm:self-auto gap-2">
              <ProductSortSelect currentSort={sort} />
            </div>
          </div>
        </div>

        {/* ── ACTIVE FILTER CHIPS & PRODUCT COUNT ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 my-5 text-xs text-[#8C7B6B]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-[#2C1D13]">
              Showing {products.length} {products.length === 1 ? 'garment' : 'garments'}
            </span>

            {/* Active Filter Badges */}
            {activeCategory && (
              <Link
                href={buildUrl({ category: null })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF6F0] border border-[#E2D5C7] text-[#2C1D13] hover:border-[#884A48] hover:text-[#884A48] transition-colors"
                title="Remove category filter"
              >
                <span>Category: <strong>{activeCategory.name}</strong></span>
                <span className="text-xs font-bold">✕</span>
              </Link>
            )}

            {onSale && (
              <Link
                href={buildUrl({ sale: false })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FDF2F4] border border-[#8B4E5A]/40 text-[#8B4E5A] hover:border-[#8B4E5A] transition-colors"
                title="Remove sale filter"
              >
                <span><strong>On Sale</strong></span>
                <span className="text-xs font-bold">✕</span>
              </Link>
            )}

            {activeSize && (
              <Link
                href={buildUrl({ size: null })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF6F0] border border-[#E2D5C7] text-[#2C1D13] hover:border-[#884A48] hover:text-[#884A48] transition-colors"
                title="Remove size filter"
              >
                <span>Size: <strong>{activeSize.name}</strong></span>
                <span className="text-xs font-bold">✕</span>
              </Link>
            )}

            {sort && sort !== 'newest' && (
              <Link
                href={buildUrl({ sort: 'newest' })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF6F0] border border-[#E2D5C7] text-[#2C1D13] hover:border-[#884A48] hover:text-[#884A48] transition-colors"
                title="Reset sorting to newest"
              >
                <span>Sort: <strong>{sort === 'price-low' ? 'Price: Low to High' : 'Price: High to Low'}</strong></span>
                <span className="text-xs font-bold">✕</span>
              </Link>
            )}
          </div>

          {hasActiveFilters && (
            <Link
              href="/products"
              className="text-[#7B5B3A] underline underline-offset-2 font-medium hover:text-[#2C1D13] transition-colors"
            >
              Clear all filters
            </Link>
          )}
        </div>

        {/* ── GARMENT GRID OR EMPTY STATE ── */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-5 bg-[#FAF8F5] rounded-2xl border border-[#EADBCE] my-8">
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#2C1D13] mb-2">
              No garments found matching criteria
            </h3>
            <p className="text-sm text-[#8C7B6B] mb-6 max-w-[420px] mx-auto">
              We couldn&apos;t find any pieces with the selected category or size combination.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 font-medium tracking-wider uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-xs px-8 py-3.5 bg-[#2C1D13] text-white hover:bg-[#7B5B3A] shadow-md hover:-translate-y-0.5"
            >
              View All Garments &rarr;
            </Link>
          </div>
        )}
      </main>

      <Footer
        footerGroups={[]}
        brandDescription={
          settings?.meta_description ||
          'Elegant modest fashion crafted with love. Premium quality pieces for your everyday and special moments.'
        }
        socialLinks={{
          instagram: settings?.social_instagram || undefined,
          facebook: settings?.social_facebook || undefined,
          whatsapp: settings?.social_whatsapp || undefined,
        }}
      />
    </>
  );
}
