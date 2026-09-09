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

      <main className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        {/* Page Heading */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 className="heading-1" style={{ marginBottom: '8px' }}>
            {onSale ? 'Sale & Special Offers' : 'The Collection'}
          </h1>
          <p className="body-md" style={{ color: 'var(--color-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Refined modest silhouettes crafted with premium fabrics for effortless grace.
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <div className="catalog-toolbar">
          {/* Category Filter Pills */}
          <div className="catalog-filters">
            <Link
              href="/products"
              className={`catalog-filter-pill ${!categorySlug && !onSale ? 'catalog-filter-pill--active' : ''}`}
            >
              All Pieces
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}${sort ? `&sort=${sort}` : ''}`}
                className={`catalog-filter-pill ${categorySlug === cat.slug ? 'catalog-filter-pill--active' : ''}`}
              >
                {cat.name}
              </Link>
            ))}

            <Link
              href="/products?sale=true"
              className={`catalog-filter-pill ${onSale ? 'catalog-filter-pill--active' : ''}`}
              style={{ color: onSale ? '#FFFFFF' : 'var(--color-burgundy)', borderColor: 'var(--color-burgundy)' }}
            >
              Sale
            </Link>
          </div>

          {/* Sizing & Sort options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {sizes.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Size:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {sizes.slice(0, 6).map((s) => (
                    <Link
                      key={s.id}
                      href={`/products?${categorySlug ? `category=${categorySlug}&` : ''}size=${s.slug}${sort ? `&sort=${sort}` : ''}`}
                      className={`catalog-size-pill ${sizeSlug === s.slug ? 'catalog-size-pill--active' : ''}`}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 28px 0', fontSize: '13px', color: 'var(--color-muted)' }}>
          <span>Showing {products.length} {products.length === 1 ? 'piece' : 'pieces'}</span>
          {(categorySlug || sizeSlug || onSale) && (
            <Link href="/products" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
              Clear all filters
            </Link>
          )}
        </div>

        {/* Product Grid or Empty State */}
        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '80px 20px' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '22px', marginBottom: '8px' }}>
              No garments found matching criteria
            </h3>
            <p className="empty-state__message" style={{ marginBottom: '24px' }}>
              Try selecting a different filter or view all pieces.
            </p>
            <Link href="/products" className="btn btn--primary">
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
