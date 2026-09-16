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

      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-8 pt-10 pb-20">
        <div className="text-center mb-12">
          <span className="text-[11px] tracking-[0.15em] uppercase text-[#7B5B3A] font-semibold">
            DISCOVER
          </span>
          <h1 className="font-display my-2 text-3xl sm:text-4xl font-bold text-[#2C1D13]">
            ZARISH Collections
          </h1>
          <p className="text-sm sm:text-base text-[#8C7B6B] max-w-[580px] mx-auto leading-relaxed">
            Curated modest edits designed with rich fabrics, clean tailoring, and everyday versatility.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] transition-transform duration-300 hover:-translate-y-1 shadow-xs hover:shadow-lg"
              >
                <div className="absolute inset-0 overflow-hidden">
                  {cat.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={cat.image_url} alt={cat.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#F5EDE4] to-[#EAE0D5]" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#3D2B1F]/70 via-[#3D2B1F]/15 to-transparent z-[1]" />
                <div className="absolute bottom-0 inset-x-0 p-6 z-[2] text-white">
                  <h3 className="font-display text-xl sm:text-2xl font-semibold leading-tight mb-2">
                    {cat.name}
                  </h3>
                  <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-wide uppercase text-white transition-all group-hover:gap-3">
                    <span>{cat.cta_label || 'EXPLORE COLLECTION'}</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">
                      <IconArrowRight size={12} />
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-5">
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#2C1D13] mb-2">
              Collections in progress
            </h3>
            <p className="text-sm text-[#8C7B6B] mb-6">
              Create categories and collections via your Admin Panel to showcase them here.
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
