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

      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-8 pt-8 pb-20">
        {/* Breadcrumb */}
   

        {/* Heading */}
        <div className="text-center my-6 sm:my-0">
          <span className="text-[11px] tracking-[0.15em] uppercase text-[#7B5B3A] font-semibold">
            PERFECT FIT
          </span>
          <h1 className="font-display my-2 text-3xl sm:text-4xl font-bold text-[#2C1D13]">
            Garments Available in Size {displaySize}
          </h1>
          <p className="text-sm text-[#8C7B6B] max-w-[540px] mx-auto leading-relaxed">
            Modest silhouettes tailored to flatter your personal proportion and height.
          </p>

          {/* Quick Size Switcher */}
          {sizes.length > 0 && (
            <div className="flex justify-center gap-2 flex-wrap mt-6">
              <Link
                href="/shop-by-size"
                className="px-4 py-2 text-[13px] font-semibold rounded-full border transition-all inline-flex items-center justify-center bg-white text-[#2C1D13] border-[#E2D5C7] hover:border-[#884A48] hover:bg-[#FAF6F0]"
              >
                All Sizes
              </Link>
              {sizes.map((s) => {
                const isCurrent = s.slug.toLowerCase() === sizeSlug;
                return (
                  <Link
                    key={s.id}
                    href={`/shop-by-size/${s.slug}`}
                    className={`px-4 py-2 text-[13px] font-semibold rounded-full border transition-all inline-flex items-center justify-center ${
                      isCurrent
                        ? 'bg-[#884A48] text-white border-[#884A48] shadow-xs'
                        : 'bg-white text-[#2C1D13] border-[#E2D5C7] hover:border-[#884A48] hover:bg-[#FAF6F0]'
                    }`}
                  >
                    {s.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Count */}
        <div className="mb-6 text-[13px] text-[#8C7B6B]">
          Showing {products.length} {products.length === 1 ? 'garment' : 'garments'} available in {displaySize}
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
              No current stock in Size {displaySize}
            </h3>
            <p className="text-sm text-[#8C7B6B] mb-6 max-w-[480px] mx-auto leading-relaxed">
              Looking for a custom size or length? We offer personalized tailoring directly via WhatsApp.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/products" className="inline-flex items-center justify-center gap-2 font-medium tracking-wide uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-sm px-8 py-3 bg-transparent text-[#3D2B1F] border-[1.5px] border-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white">
                View All Pieces
              </Link>
              {settings?.social_whatsapp && (
                <a
                  href={`https://wa.me/${settings.social_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ZARISH, I would like to inquire about custom sizing for size ${displaySize}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 font-medium tracking-wide uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-sm px-8 py-3 bg-[#3D2B1F] text-white hover:bg-[#7B5B3A] hover:-translate-y-0.5 hover:shadow-md"
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
