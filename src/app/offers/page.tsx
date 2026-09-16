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

      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-8 pt-10 pb-20">
        {/* Banner */}
        <div className="text-center mb-12 py-10 sm:py-12 px-6 bg-[#FDF2F4] rounded-2xl border border-[#F8D7DA]">
          <span className="text-[11px] tracking-[0.15em] uppercase text-[#8B4E5A] font-bold">
            LIMITED TIME PROMOTIONS
          </span>
          <h1 className="font-display my-2 text-3xl sm:text-4xl font-bold text-[#8B4E5A]">
            Exclusive Seasonal Offers
          </h1>
          <p className="text-sm sm:text-base text-[#5C4A3E] max-w-[540px] mx-auto leading-relaxed">
            Enjoy special pricing on selected modest silhouettes and seasonal archives.
          </p>
        </div>

        {saleProducts.length > 0 ? (
          <div>
            <div className="mb-6 text-[13px] text-[#8C7B6B]">
              Showing {saleProducts.length} discounted {saleProducts.length === 1 ? 'piece' : 'pieces'}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {saleProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 px-5">
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#2C1D13] mb-2">
              No active sale pieces at this moment
            </h3>
            <p className="text-sm text-[#8C7B6B] mb-6">
              Subscribe to our newsletter or check back soon for our next seasonal promotion.
            </p>
            <Link href="/products" className="inline-flex items-center justify-center gap-2 font-medium tracking-wide uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-sm px-8 py-3 bg-[#3D2B1F] text-white hover:bg-[#7B5B3A] hover:-translate-y-0.5 hover:shadow-md">
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
