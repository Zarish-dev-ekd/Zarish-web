import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getCategories,
  getSiteSettings,
  getAnnouncements,
  getNavigationItems,
} from '@/lib/supabase';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { IconArrowRight } from '@/components/icons';

export const metadata: Metadata = {
  title: 'All Collections | ZARISH by Nehala Mufeed',
  description: 'Explore the curated modest fashion collections by ZARISH.',
};

export default async function CollectionsPage() {
  const [categories, settings, announcements, navigationItems] = await Promise.all([
    getCategories(),
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
  ]);

  return (
    <>
      <AnnouncementBar announcements={announcements} />
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span
            style={{
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              fontWeight: 600,
            }}
          >
            DISCOVER
          </span>
          <h1 className="heading-1" style={{ margin: '8px 0 12px 0' }}>
            ZARISH Collections
          </h1>
          <p className="body-md" style={{ color: 'var(--color-muted)', maxWidth: '580px', margin: '0 auto' }}>
            Curated modest edits designed with rich fabrics, clean tailoring, and everyday versatility.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="category-card"
                style={{ aspectRatio: '3/4' }}
              >
                <div className="category-card__image">
                  {cat.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={cat.image_url} alt={cat.name} loading="lazy" />
                  ) : (
                    <div className="category-card__placeholder" />
                  )}
                </div>
                <div className="category-card__overlay" />
                <div className="category-card__content">
                  <h3 className="category-card__name" style={{ fontSize: '24px' }}>
                    {cat.name}
                  </h3>
                  <span className="category-card__cta">
                    {cat.cta_label || 'EXPLORE COLLECTION'} <IconArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '80px 20px' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '22px', marginBottom: '8px' }}>
              Collections in progress
            </h3>
            <p className="empty-state__message" style={{ marginBottom: '24px' }}>
              Create categories and collections via your Admin Panel to showcase them here.
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
