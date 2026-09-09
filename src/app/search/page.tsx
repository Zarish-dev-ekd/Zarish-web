import Link from 'next/link';
import type { Metadata } from 'next';
import {
  searchProducts,
  getLatestProducts,
  getSiteSettings,
  getAnnouncements,
  getNavigationItems,
} from '@/lib/supabase';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { IconSearch } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Search Garments | ZARISH by Nehala Mufeed',
  description: 'Search our modest fashion catalog for abayas, dresses, and co-ords.',
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || '';

  const [searchResults, popularProducts, settings, announcements, navigationItems] = await Promise.all([
    query ? searchProducts(query) : Promise.resolve([]),
    !query ? getLatestProducts(4) : Promise.resolve([]),
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
  ]);

  return (
    <>
      <AnnouncementBar announcements={announcements} />
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        {/* Search Header */}
        <div style={{ maxWidth: '640px', margin: '0 auto 48px auto', textAlign: 'center' }}>
          <h1 className="heading-1" style={{ marginBottom: '16px' }}>
            Find Your Style
          </h1>
          <form action="/search" method="GET" style={{ position: 'relative' }}>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search by garment, fabric, or style (e.g. Abaya, Nida, Green)..."
              className="admin-input"
              style={{
                padding: '14px 48px 14px 18px',
                fontSize: '15px',
                borderRadius: '30px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
              autoFocus
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-primary)',
              }}
              aria-label="Search"
            >
              <IconSearch size={20} />
            </button>
          </form>
        </div>

        {/* Results Section */}
        {query ? (
          <div>
            <div style={{ marginBottom: '24px', fontSize: '14px', color: 'var(--color-muted)' }}>
              {searchResults.length > 0 ? (
                <span>
                  Found <strong>{searchResults.length}</strong> results for &ldquo;<strong>{query}</strong>&rdquo;
                </span>
              ) : (
                <span>No pieces found for &ldquo;<strong>{query}</strong>&rdquo;</span>
              )}
            </div>

            {searchResults.length > 0 ? (
              <div className="product-grid">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '60px 20px' }}>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', marginBottom: '8px' }}>
                  No exact matches found
                </h3>
                <p className="empty-state__message" style={{ marginBottom: '20px' }}>
                  Try checking the spelling or searching with broader terms like &ldquo;abaya&rdquo; or &ldquo;black&rdquo;.
                </p>
                <Link href="/products" className="btn btn--primary">
                  Browse All Collections
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Suggestions when no query is typed */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '12px' }}>
                POPULAR SEARCHES:
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {['Abayas', 'New Arrivals', 'Black', 'Nida Fabric', 'Embroidery'].map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="catalog-filter-pill"
                    style={{ fontSize: '13px' }}
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>

            {popularProducts.length > 0 && (
              <div style={{ marginTop: '48px' }}>
                <h2 className="heading-3" style={{ textAlign: 'center', marginBottom: '24px' }}>
                  Trending Pieces
                </h2>
                <div className="product-grid">
                  {popularProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
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
