import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  const fallbackNav = [
    { id: 'nav-1', label: 'New Arrivals', href: '/collections/new-arrivals', display_order: 1, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
    { id: 'nav-2', label: 'Collections', href: '/collections', display_order: 2, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
    { id: 'nav-3', label: 'Shop by Size', href: '/shop-by-size', display_order: 3, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
    { id: 'nav-4', label: 'Offers', href: '/offers', display_order: 4, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
    { id: 'nav-5', label: 'About', href: '/about', display_order: 5, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
  ];

  return (
    <>
      <Header navigationItems={fallbackNav} cartItemCount={0} />

      <main className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ maxWidth: '500px' }}>
          <span style={{ fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: 600 }}>
            404 — PAGE NOT FOUND
          </span>
          <h1 className="heading-1" style={{ margin: '12px 0 16px 0', fontSize: '36px' }}>
            A Moment of Stillness
          </h1>
          <p className="body-md" style={{ color: 'var(--color-muted)', marginBottom: '32px', lineHeight: '1.7' }}>
            The garment or page you were looking for seems to have moved or is no longer available.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/" className="btn btn--primary">
              Return to Homepage
            </Link>
            <Link href="/products" className="btn btn--secondary">
              Explore Collections
            </Link>
          </div>
        </div>
      </main>

      <Footer
        footerGroups={[]}
        brandDescription="Elegant modest fashion crafted with love. Premium quality pieces for your everyday and special moments."
        socialLinks={{}}
      />
    </>
  );
}
