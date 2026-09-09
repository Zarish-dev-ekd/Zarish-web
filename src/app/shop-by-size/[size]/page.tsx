import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getFilteredProducts,
  getSizes,
  getSiteSettings,
  getAnnouncements,
  getNavigationItems,
} from '@/lib/supabase';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';

interface ShopBySizePageProps {
  params: Promise<{ size: string }>;
}

export async function generateMetadata({ params }: ShopBySizePageProps): Promise<Metadata> {
  const { size } = await params;
  const upperSize = size.toUpperCase();
  return {
    title: `Garments in Size ${upperSize} | ZARISH by Nehala Mufeed`,
    description: `Discover elegant modest garments crafted and ready in size ${upperSize} by ZARISH.`,
  };
}

export default async function ShopBySizePage({ params }: ShopBySizePageProps) {
  const { size } = await params;
  const sizeSlug = size.toLowerCase();
  const displaySize = size.toUpperCase();

  const [products, sizes, settings, announcements, navigationItems] = await Promise.all([
    getFilteredProducts({ sizeSlug }),
    getSizes(),
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
  ]);

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
              <Link href="/products">Shop by Size</Link>
            </li>
            <li>/</li>
            <li aria-current="page" className="product-breadcrumbs__current">
              Size {displaySize}
            </li>
          </ol>
        </nav>

        {/* Heading */}
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
            PERFECT FIT
          </span>
          <h1 className="heading-1" style={{ margin: '8px 0 12px 0' }}>
            Garments Available in Size {displaySize}
          </h1>
          <p className="body-md" style={{ color: 'var(--color-muted)', maxWidth: '540px', margin: '0 auto' }}>
            Modest silhouettes tailored to flatter your personal proportion and height.
          </p>

          {/* Quick Size Switcher */}
          {sizes.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '24px' }}>
              {sizes.map((s) => {
                const isCurrent = s.slug.toLowerCase() === sizeSlug;
                return (
                  <Link
                    key={s.id}
                    href={`/shop-by-size/${s.slug}`}
                    className={`catalog-size-pill ${isCurrent ? 'catalog-size-pill--active' : ''}`}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    {s.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Count */}
        <div style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--color-muted)' }}>
          Showing {products.length} {products.length === 1 ? 'garment' : 'garments'} available in {displaySize}
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
              No current stock in Size {displaySize}
            </h3>
            <p className="empty-state__message" style={{ marginBottom: '24px', maxWidth: '480px', margin: '0 auto 24px auto' }}>
              Looking for a custom size or length? We offer personalized tailoring directly via WhatsApp.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <Link href="/products" className="btn btn--secondary">
                View All Pieces
              </Link>
              {settings?.social_whatsapp && (
                <a
                  href={`https://wa.me/${settings.social_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ZARISH, I would like to inquire about custom sizing for size ${displaySize}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                >
                  Custom Sizing Inquiry
                </a>
              )}
            </div>
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
