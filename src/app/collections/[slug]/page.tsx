import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getLatestProducts,
  getCategoryBySlug,
  getFilteredProducts,
  getSiteSettings,
  getAnnouncements,
  getNavigationItems,
} from '@/lib/supabase';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';

interface CollectionSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const isNewArrivals = slug === 'new-arrivals';
  const title = isNewArrivals ? 'New Arrivals' : slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${title} | ZARISH by Nehala Mufeed`,
    description: `Shop the latest ${title.toLowerCase()} collection from ZARISH.`,
  };
}

export default async function CollectionSlugPage({ params }: CollectionSlugPageProps) {
  const { slug } = await params;
  const isNewArrivals = slug === 'new-arrivals';

  const [category, latest, settings, announcements, navigationItems] = await Promise.all([
    !isNewArrivals ? getCategoryBySlug(slug) : null,
    isNewArrivals ? getLatestProducts(24) : null,
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
  ]);

  const products = isNewArrivals
    ? latest || []
    : await getFilteredProducts({ categorySlug: slug });

  const title = isNewArrivals
    ? 'New Arrivals'
    : category?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <AnnouncementBar announcements={announcements} />
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main className="container" style={{ paddingTop: '32px', paddingBottom: '80px' }}>
        {/* Breadcrumb */}
        <nav className="product-breadcrumbs" aria-label="Breadcrumb">
          <ol className="product-breadcrumbs__list">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/collections">Collections</Link>
            </li>
            <li>/</li>
            <li aria-current="page" className="product-breadcrumbs__current">
              {title}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div style={{ textAlign: 'center', margin: '24px 0 40px 0' }}>
          <span
            style={{
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              fontWeight: 600,
            }}
          >
            EDITORIAL COLLECTION
          </span>
          <h1 className="heading-1" style={{ margin: '8px 0 12px 0' }}>
            {title}
          </h1>
          <p className="body-md" style={{ color: 'var(--color-muted)', maxWidth: '540px', margin: '0 auto' }}>
            {isNewArrivals
              ? 'Our newest seasonal silhouettes, tailored with impeccable attention to fabric and fit.'
              : category?.description || 'Curated designer pieces for everyday and special moments.'}
          </p>
        </div>

        {/* Count */}
        <div style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--color-muted)' }}>
          Showing {products.length} {products.length === 1 ? 'piece' : 'pieces'}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '80px 20px' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '22px', marginBottom: '8px' }}>
              Collection refreshing soon
            </h3>
            <p className="empty-state__message" style={{ marginBottom: '24px' }}>
              No garments are currently tagged in this edit.
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
