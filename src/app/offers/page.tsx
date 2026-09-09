import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getFilteredProducts,
  getSiteSettings,
  getAnnouncements,
  getNavigationItems,
} from '@/lib/supabase';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';

export const metadata: Metadata = {
  title: 'Special Offers & Sale | ZARISH by Nehala Mufeed',
  description: 'Limited-edition modest fashion pieces on exclusive promotional pricing.',
};

export default async function OffersPage() {
  const [saleProducts, settings, announcements, navigationItems] = await Promise.all([
    getFilteredProducts({ onSale: true }),
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
  ]);

  return (
    <>
      <AnnouncementBar announcements={announcements} />
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        {/* Banner */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '48px',
            padding: '48px 24px',
            backgroundColor: '#FDF2F4',
            borderRadius: '12px',
            border: '1px solid #F8D7DA',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-burgundy)',
              fontWeight: 700,
            }}
          >
            LIMITED TIME PROMOTIONS
          </span>
          <h1 className="heading-1" style={{ margin: '8px 0 12px 0', color: 'var(--color-burgundy)' }}>
            Exclusive Seasonal Offers
          </h1>
          <p className="body-md" style={{ color: 'var(--color-text-secondary)', maxWidth: '540px', margin: '0 auto' }}>
            Enjoy special pricing on selected modest silhouettes and seasonal archives.
          </p>
        </div>

        {saleProducts.length > 0 ? (
          <div>
            <div style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--color-muted)' }}>
              Showing {saleProducts.length} discounted {saleProducts.length === 1 ? 'piece' : 'pieces'}
            </div>
            <div className="product-grid">
              {saleProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '80px 20px' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '22px', marginBottom: '8px' }}>
              No active sale pieces at this moment
            </h3>
            <p className="empty-state__message" style={{ marginBottom: '24px' }}>
              Subscribe to our newsletter or check back soon for our next seasonal promotion.
            </p>
            <Link href="/products" className="btn btn--primary">
              Discover Full Collection
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
