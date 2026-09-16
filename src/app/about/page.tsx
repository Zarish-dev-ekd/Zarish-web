import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  getSiteSettings,
  getAnnouncements,
  getNavigationItems,
} from '@/lib/supabase';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { IconArrowRight } from '@/components/icons';

export const metadata: Metadata = {
  title: 'About ZARISH by Nehala Mufeed | The Brand Story',
  description: 'Learn about the vision, craftsmanship, and modest fashion philosophy of ZARISH by Nehala Mufeed.',
};

export default async function AboutPage() {
  const [settings, announcements, navigationItems] = await Promise.all([
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
  ]);

  return (
    <>
      <AnnouncementBar announcements={announcements} />
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-8 pt-12 pb-24">
        {/* Story Hero */}
        <div className="max-w-[800px] mx-auto mb-16 text-center">
          <span className="text-[11px] tracking-[0.2em] uppercase text-[#7B5B3A] font-semibold">
            OUR ESSENCE
          </span>
          <h1 className="font-display my-4 text-3xl sm:text-4xl lg:text-[38px] font-bold text-[#2C1D13]">
            Beauty in Modesty
          </h1>
          <p className="text-base sm:text-lg text-[#5C4A3E] leading-relaxed italic">
            &ldquo;Modesty is not about hiding; it is about revealing your inherent grace with confidence, dignity, and effortless luxury.&rdquo;
          </p>
          <p className="mt-3 font-semibold text-[#7B5B3A]">
            — Nehala Mufeed, Founder & Creative Director
          </p>
        </div>

        {/* Brand Narrative Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative h-[340px] sm:h-[440px] rounded-2xl overflow-hidden bg-[#FBF6F0] border border-[#EBDCD0] flex items-center justify-center p-8">
            <Image
              src="/logo-zarish.png"
              alt="ZARISH by Nehala Mufeed"
              width={260}
              height={90}
              className="object-contain"
            />
          </div>

          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C1D13] mb-4">
              Designed with Purpose
            </h2>
            <p className="text-sm sm:text-base text-[#8C7B6B] leading-relaxed mb-4">
              Born from a passion for timeless modest aesthetics, <strong className="text-[#2C1D13]">ZARISH</strong> bridges traditional grace and modern minimalism. We believe that what you wear should make you feel effortlessly poised, comfortable, and true to your values.
            </p>
            <p className="text-sm sm:text-base text-[#8C7B6B] leading-relaxed mb-6">
              Every collection is thoughtfully curated — from the selection of breathable Korean and Arabian nida fabrics to delicate cuff embroidery, precision seam lines, and flattering drape silhouettes that move with you throughout your day.
            </p>

            <Link href="/products" className="inline-flex items-center justify-center gap-2 font-medium tracking-wide uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-sm px-8 py-3 bg-[#3D2B1F] text-white hover:bg-[#7B5B3A] hover:-translate-y-0.5 hover:shadow-md">
              Explore Our Creations <IconArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="border-t border-[#E2D5C7] pt-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C1D13]">The ZARISH Pillars</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#FBF6F0] rounded-2xl border border-[#EBDCD0]">
              <span className="font-display text-3xl text-[#7B5B3A] font-bold">01</span>
              <h3 className="font-display text-xl font-semibold text-[#2C1D13] my-3">
                Uncompromised Fabrics
              </h3>
              <p className="text-xs sm:text-sm text-[#8C7B6B] leading-relaxed">
                We work directly with textile artisans to source premium nida, modal, silk crepes, and lightweight chiffons that withstand everyday wear while maintaining luxurious texture.
              </p>
            </div>

            <div className="p-8 bg-[#FBF6F0] rounded-2xl border border-[#EBDCD0]">
              <span className="font-display text-3xl text-[#7B5B3A] font-bold">02</span>
              <h3 className="font-display text-xl font-semibold text-[#2C1D13] my-3">
                Proportion & Sizing
              </h3>
              <p className="text-xs sm:text-sm text-[#8C7B6B] leading-relaxed">
                Every modest silhouette requires thoughtful balance. We provide extensive sizing options and custom-tailoring consultations to celebrate every woman&apos;s height and fit.
              </p>
            </div>

            <div className="p-8 bg-[#FBF6F0] rounded-2xl border border-[#EBDCD0]">
              <span className="font-display text-3xl text-[#7B5B3A] font-bold">03</span>
              <h3 className="font-display text-xl font-semibold text-[#2C1D13] my-3">
                Personal Connection
              </h3>
              <p className="text-xs sm:text-sm text-[#8C7B6B] leading-relaxed">
                We treat every customer as part of the ZARISH family, offering one-on-one styling guidance and bespoke assistance via WhatsApp directly from our design team.
              </p>
            </div>
          </div>
        </div>
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
