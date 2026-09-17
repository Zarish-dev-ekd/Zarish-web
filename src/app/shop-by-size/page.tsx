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
import ShopBySizeClient from './ShopBySizeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Shop by Size | ZARISH by Nehala Mufeed',
  description: 'Find modest luxury pieces tailored for your fit and proportion. Filter ready-to-wear garments by size at ZARISH.',
};

interface ShopBySizePageProps {
  searchParams: Promise<{
    size?: string;
  }>;
}

export default async function ShopBySizePage({ searchParams }: ShopBySizePageProps) {
  const resolvedParams = await searchParams;
  const initialSize = resolvedParams.size || '';

  const [products, sizes, settings, announcements, navigationItems] = await Promise.all([
    getFilteredProducts(),
    getSizes(),
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
  ]);

  return (
    <>
      <AnnouncementBar announcements={announcements} />
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-8 pt-10 pb-20">
        <ShopBySizeClient
          products={products}
          sizes={sizes}
          initialSize={initialSize}
          settings={settings}
        />
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
