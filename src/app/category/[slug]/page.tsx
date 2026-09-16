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

      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-8 pt-8 pb-20">
        {/* Breadcrumb */}
    

        {/* Category Header Banner */}
        <div className="text-center my-6 sm:my-12 py-10 sm:py-12 px-6 bg-[#FBF6F0] rounded-2xl border border-[#EBDCD0]">
          <span className="text-[11px] tracking-[0.15em] uppercase text-[#7B5B3A] font-semibold">
            COLLECTION
          </span>
          <h1 className="font-display my-2 text-3xl sm:text-4xl font-bold text-[#2C1D13]">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-sm sm:text-base text-[#8C7B6B] max-w-[640px] mx-auto leading-relaxed">
              {category.description}
            </p>
          )}
        </div>

        {/* Garment Grid */}
        <div className="mb-6 text-[13px] text-[#8C7B6B]">
          Showing {products.length} {products.length === 1 ? 'piece' : 'pieces'} in {category.name}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-5">
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#2C1D13] mb-2">
              New pieces arriving soon
            </h3>
            <p className="text-sm text-[#8C7B6B] mb-6">
              We are currently tailoring exclusive garments for this collection.
            </p>
            <Link href="/products" className="inline-flex items-center justify-center gap-2 font-medium tracking-wide uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-sm px-8 py-3 bg-transparent text-[#3D2B1F] border-[1.5px] border-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white">
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
