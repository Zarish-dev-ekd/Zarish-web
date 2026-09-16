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

  return (
    <>
      <AnnouncementBar announcements={announcements} />
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-8 pt-10 pb-20">
        {/* Page Heading */}
        <div className="text-center mb-9">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2C1D13] mb-2">
            {onSale ? 'Sale & Special Offers' : 'The Collection'}
          </h1>
          <p className="text-sm sm:text-base text-[#8C7B6B] max-w-[600px] mx-auto leading-relaxed">
            Refined modest silhouettes crafted with premium fabrics for effortless grace.
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2D5C7]">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/products"
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all whitespace-nowrap inline-flex items-center justify-center cursor-pointer ${
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
                href={`/products?category=${cat.slug}${sort ? `&sort=${sort}` : ''}`}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-all whitespace-nowrap inline-flex items-center justify-center cursor-pointer ${
                  categorySlug === cat.slug
                    ? 'bg-[#2C1D13] text-white border-[#2C1D13] shadow-xs'
                    : 'bg-white text-[#4A3728] border-[#E2D5C7] hover:border-[#2C1D13] hover:bg-[#FAF6F0]'
                }`}
              >
                {cat.name}
              </Link>
            ))}

            <Link
              href="/products?sale=true"
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all whitespace-nowrap inline-flex items-center justify-center cursor-pointer ${
                onSale
                  ? 'bg-[#8B4E5A] text-white border-[#8B4E5A] shadow-xs'
                  : 'bg-white text-[#8B4E5A] border-[#8B4E5A]/50 hover:bg-[#FDF2F4]'
              }`}
            >
              Sale
            </Link>
          </div>

          {/* Sizing & Sort options */}
          <div className="flex items-center gap-4 flex-wrap">
            {sizes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8C7B6B]">Size:</span>
                <div className="flex gap-1.5">
                  {sizes.slice(0, 6).map((s) => (
                    <Link
                      key={s.id}
                      href={`/products?${categorySlug ? `category=${categorySlug}&` : ''}size=${s.slug}${sort ? `&sort=${sort}` : ''}`}
                      className={`w-8 h-8 rounded-full text-xs font-semibold border transition-all inline-flex items-center justify-center ${
                        sizeSlug === s.slug
                          ? 'bg-[#884A48] text-white border-[#884A48] shadow-xs'
                          : 'bg-white text-[#2C1D13] border-[#E2D5C7] hover:border-[#884A48] hover:bg-[#FAF6F0]'
                      }`}
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products Count */}
        <div className="flex justify-between items-center my-6 text-[13px] text-[#8C7B6B]">
          <span>Showing {products.length} {products.length === 1 ? 'piece' : 'pieces'}</span>
          {(categorySlug || sizeSlug || onSale) && (
            <Link href="/products" className="text-[#7B5B3A] underline font-medium hover:text-[#2C1D13]">
              Clear all filters
            </Link>
          )}
        </div>

        {/* Product Grid or Empty State */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-5">
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#2C1D13] mb-2">
              No garments found matching criteria
            </h3>
            <p className="text-sm text-[#8C7B6B] mb-6">
              Try selecting a different filter or view all pieces.
            </p>
            <Link href="/products" className="inline-flex items-center justify-center gap-2 font-medium tracking-wide uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-sm px-8 py-3 bg-[#3D2B1F] text-white hover:bg-[#7B5B3A] hover:-translate-y-0.5 hover:shadow-md">
              View All Garments
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
