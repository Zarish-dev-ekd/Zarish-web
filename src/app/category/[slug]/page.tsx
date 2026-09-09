import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
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

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Collection Not Found | ZARISH',
    };
  }

  return {
    title: `${category.name} Collection | ZARISH by Nehala Mufeed`,
    description: category.description || `Discover elegant modest ${category.name.toLowerCase()} by ZARISH.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const [category, products, settings, announcements, navigationItems] = await Promise.all([
    getCategoryBySlug(slug),
    getFilteredProducts({ categorySlug: slug }),
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
  ]);

  if (!category) {
    notFound();
  }

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
              <Link href="/products">Collections</Link>
            </li>
            <li>/</li>
            <li aria-current="page" className="product-breadcrumbs__current">
              {category.name}
            </li>
          </ol>
        </nav>

        {/* Category Header Banner */}
        <div
          style={{
            textAlign: 'center',
            margin: '24px 0 48px 0',
            padding: '48px 24px',
            backgroundColor: 'var(--color-cream)',
            borderRadius: '12px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              fontWeight: 600,
            }}
          >
            COLLECTION
          </span>
          <h1 className="heading-1" style={{ margin: '8px 0 12px 0' }}>
            {category.name}
          </h1>
          {category.description && (
            <p className="body-md" style={{ color: 'var(--color-muted)', maxWidth: '640px', margin: '0 auto' }}>
              {category.description}
            </p>
          )}
        </div>

        {/* Garment Grid */}
        <div style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--color-muted)' }}>
          Showing {products.length} {products.length === 1 ? 'piece' : 'pieces'} in {category.name}
        </div>

        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '80px 20px' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '22px', marginBottom: '8px' }}>
              New pieces arriving soon
            </h3>
            <p className="empty-state__message" style={{ marginBottom: '24px' }}>
              We are currently tailoring exclusive garments for this collection.
            </p>
            <Link href="/products" className="btn btn--secondary">
              Browse Other Collections
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
