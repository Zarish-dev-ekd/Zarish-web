import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  getNewArrivalProducts,
  getCategoryBySlug,
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
    description: isNewArrivals
      ? 'Explore our newly launched modest fashion silhouettes and fresh arrivals by ZARISH.'
      : `Shop the latest ${title.toLowerCase()} collection from ZARISH.`,
  };
}

export default async function CollectionSlugPage({ params }: CollectionSlugPageProps) {
  const { slug } = await params;
  const isNewArrivals = slug === 'new-arrivals';

  if (!isNewArrivals) {
    redirect(`/products?category=${encodeURIComponent(slug)}`);
  }

  const [products, settings, announcements, navigationItems] = await Promise.all([
    getNewArrivalProducts(24),
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
  ]);

  return (
    <>
      <AnnouncementBar announcements={announcements} />
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-8 pt-8 pb-20">
        {/* New Arrivals Editorial Header */}
        <div className="text-center my-6 sm:my-8 max-w-2xl mx-auto">
          <span className="text-[11px] tracking-[0.2em] uppercase text-[#7B5B3A] font-semibold">
            JUST LAUNCHED • NEW SEASON
          </span>
          <h1 className="font-display my-2 text-3xl sm:text-4xl font-bold text-[#2C1D13]">
            New Arrivals
          </h1>
          <p className="text-xs sm:text-sm text-[#8C7B6B] leading-relaxed">
            Our newest seasonal silhouettes fresh from the atelier. Tailored with premium fabrics for effortless confidence and memorable moments.
          </p>
        </div>

        {/* Count & Direct Link to Full Shop Catalog */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E2D5C7] text-xs text-[#8C7B6B]">
          <span className="font-medium text-[#2C1D13]">
            Showing {products.length} {products.length === 1 ? 'new garment' : 'new garments'}
          </span>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-[#7B5B3A] hover:text-[#2C1D13] font-semibold transition-colors uppercase tracking-wider text-[11px]"
          >
            <span>Explore All Garments</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-5 bg-[#FAF8F5] rounded-2xl border border-[#EADBCE] my-8">
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#2C1D13] mb-2">
              New collection dropping soon
            </h3>
            <p className="text-sm text-[#8C7B6B] mb-6 max-w-[420px] mx-auto">
              Our artisans are currently crafting fresh silhouettes. Explore our full modest collection in the meantime.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 font-medium tracking-wider uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-xs px-8 py-3.5 bg-[#2C1D13] text-white hover:bg-[#7B5B3A] shadow-md hover:-translate-y-0.5"
            >
              Browse All Garments &rarr;
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
