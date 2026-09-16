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

      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-8 pt-8 pb-20">


        {/* Header */}
        <div className="text-center my-6 sm:my-2">
          <span className="text-[11px] tracking-[0.15em] uppercase text-[#7B5B3A] font-semibold">
            EDITORIAL COLLECTION
          </span>
          <h1 className="font-display my-2 text-3xl sm:text-4xl font-bold text-[#2C1D13]">
            {title}
          </h1>
          <p className="text-sm text-[#8C7B6B] max-w-[540px] mx-auto leading-relaxed">
            {isNewArrivals
              ? 'Our newest seasonal silhouettes, tailored with impeccable attention to fabric and fit.'
              : category?.description || 'Curated designer pieces for everyday and special moments.'}
          </p>
        </div>

        {/* Count */}
        <div className="mb-6 text-[13px] text-[#8C7B6B]">
          Showing {products.length} {products.length === 1 ? 'piece' : 'pieces'}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-5">
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#2C1D13] mb-2">
              Collection refreshing soon
            </h3>
            <p className="text-sm text-[#8C7B6B] mb-6">
              No garments are currently tagged in this edit.
            </p>
            <Link href="/products" className="inline-flex items-center justify-center gap-2 font-medium tracking-wide uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-sm px-8 py-3 bg-[#3D2B1F] text-white hover:bg-[#7B5B3A] hover:-translate-y-0.5 hover:shadow-md">
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
