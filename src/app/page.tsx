/* ============================================================
   ZARISH — Homepage
   Server Component. Assembles all homepage sections.
   Connected to Supabase live data with graceful empty states.
   ============================================================ */

import {
  getAnnouncements,
  getNavigationItems,
  getActiveHeroSlide,
  getBenefits,
  getCategories,
  getSizes,
  getLatestProducts,
  getSiteSettings,
} from '@/lib/supabase';
import type { NavigationItem } from '@/lib/types';

import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import BenefitsStrip from '@/components/home/BenefitsStrip';
import CategorySection from '@/components/home/CategorySection';
import ShopBySize from '@/components/home/ShopBySize';
import JustLaunched from '@/components/home/JustLaunched';
import BrandStory from '@/components/home/BrandStory';
import Newsletter from '@/components/home/Newsletter';
import Footer from '@/components/layout/Footer';

// Default navigation structure when none configured yet in database
const fallbackNav: NavigationItem[] = [
  { id: 'nav-1', label: 'New Arrivals', href: '/collections/new-arrivals', display_order: 1, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
  { id: 'nav-2', label: 'Collections', href: '/collections', display_order: 2, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
  { id: 'nav-3', label: 'Shop by Size', href: '/shop-by-size', display_order: 3, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
  { id: 'nav-4', label: 'Offers', href: '/offers', display_order: 4, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
  { id: 'nav-5', label: 'About', href: '/about', display_order: 5, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
];

export default async function HomePage() {
  // Fetch all homepage data server-side in parallel from Supabase
  const [
    siteSettings,
    announcements,
    dbNavItems,
    heroSlide,
    benefits,
    categories,
    sizes,
    newArrivals,
  ] = await Promise.all([
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
    getActiveHeroSlide(),
    getBenefits(),
    getCategories(),
    getSizes(),
    getLatestProducts(8),
  ]);

  const navigationItems = dbNavItems.length > 0 ? dbNavItems : fallbackNav;

  return (
    <>
      {/* A. TOP INFORMATION BAR */}
      <AnnouncementBar announcements={announcements} />

      {/* B. MAIN NAVIGATION */}
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main id="main-content">
        {/* C. HERO */}
        <HeroSection hero={heroSlide} />

        {/* D. BENEFITS STRIP */}
        <BenefitsStrip benefits={benefits} />

        {/* E. SHOP BY CATEGORY */}
        <CategorySection
          categories={categories}
          sectionTitle="SHOP BY CATEGORY"
          sectionSubtitle="Find your favourites"
          viewAllText="View All Collections"
          viewAllUrl="/collections"
        />

        {/* F. SHOP BY SIZE */}
        <ShopBySize
          sizes={sizes}
          sectionTitle="WHAT'S YOUR SIZE?"
          sectionSubtitle="Find the perfect fit for you."
          ctaText="EXPLORE STYLES IN MY SIZE"
          decorativeText="Every Size Beautiful"
        />

        {/* G. JUST LAUNCHED */}
        <JustLaunched
          products={newArrivals}
          sectionTitle="JUST LAUNCHED"
          sectionSubtitle="Fresh styles, made for you"
          viewAllText="View All"
          viewAllUrl="/collections/new-arrivals"
        />

        {/* I. BRAND STORY */}
        <BrandStory story={null} />

        {/* J. NEWSLETTER */}
        <Newsletter
          heading="Stay in Style"
          description="Subscribe to get exclusive offers, new arrivals, and style inspiration."
          ctaText="Subscribe"
          isActive={true}
        />
      </main>

      {/* K. FOOTER */}
      <Footer
        footerGroups={[]}
        brandDescription={
          siteSettings?.meta_description ||
          'Elegant modest fashion crafted with love. Premium quality pieces for your everyday and special moments.'
        }
        socialLinks={{
          instagram: siteSettings?.social_instagram || undefined,
          facebook: siteSettings?.social_facebook || undefined,
          whatsapp: siteSettings?.social_whatsapp || undefined,
        }}
      />
    </>
  );
}
