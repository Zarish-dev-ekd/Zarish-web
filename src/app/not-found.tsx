import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  const fallbackNav = [
    { id: 'nav-shop', label: 'Shop All', href: '/products', display_order: 1, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
    { id: 'nav-1', label: 'New Arrivals', href: '/collections/new-arrivals', display_order: 2, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
    { id: 'nav-2', label: 'Collections', href: '/collections', display_order: 3, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
    { id: 'nav-3', label: 'Shop by Size', href: '/shop-by-size', display_order: 4, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
    { id: 'nav-5', label: 'About Us', href: '/about', display_order: 5, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
  ];

  return (
    <>
      <Header navigationItems={fallbackNav} cartItemCount={0} />

      <main className="w-full max-w-[1280px] mx-auto min-h-[60vh] flex items-center justify-center text-center px-5 py-20">
        <div className="max-w-[500px]">
          <span className="text-xs tracking-[0.2em] uppercase text-[#7B5B3A] font-semibold">
            404 — PAGE NOT FOUND
          </span>
          <h1 className="font-display my-3 text-3xl sm:text-4xl font-bold text-[#2C1D13]">
            A Moment of Stillness
          </h1>
          <p className="text-sm sm:text-base text-[#8C7B6B] mb-8 leading-relaxed">
            The garment or page you were looking for seems to have moved or is no longer available.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 font-medium tracking-wide uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-sm px-8 py-3 bg-[#3D2B1F] text-white hover:bg-[#7B5B3A] hover:-translate-y-0.5 hover:shadow-md">
              Return to Homepage
            </Link>
            <Link href="/products" className="inline-flex items-center justify-center gap-2 font-medium tracking-wide uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-sm px-8 py-3 bg-transparent text-[#3D2B1F] border-[1.5px] border-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white">
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
