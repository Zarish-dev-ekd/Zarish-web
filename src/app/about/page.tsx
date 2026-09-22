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
          <p className="text-xs sm:text-sm text-[#5C4A3E]">
            Modesty is not about hiding; it is about revealing your inherent grace with confidence, dignity, and effortless luxury.
          </p>
          <p className="mt-3 text-xs font-semibold text-[#7B5B3A]">
            Nehala Mufeed, Founder & Creative Director
          </p>
        </div>

        {/* Founder Letter & Brand Card Block (matching reference) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center mb-24">
          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(44,29,19,0.12)] border border-[#3A0F17]/20">
              <Image
                src="/zarish-brand-card.webp"
                alt="ZARISH by Nehala Mufeed"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="w-full max-w-[560px]">
            <span className="text-[11px] tracking-[0.22em] uppercase text-[#7B5B3A] font-semibold block mb-3">
              A NOTE FROM OUR FOUNDER
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#2C1D13] tracking-tight mb-5">
              Dear Zarish Family,
            </h2>

            <div className="space-y-4 text-xs sm:text-[14px] lg:text-[15px] leading-relaxed sm:leading-[1.8] text-[#5C4A3E]">
              <p>
                Zarish started as a small dream my husband and I shared. While building it, we were
                also learning to be parents, and our little girl was growing alongside us. There
                were days we wished we could give her more of our time, but she quietly waited,
                adjusted, and grew with us. Looking back, I realise she didn’t just grow up alongside
                Zarish—she grew up with it.
              </p>

              <p>
                I’m forever grateful to my husband for being my strength through every high and low,
                believing in me when I doubted myself, and always encouraging me to keep going. And
                to our Zarish family, thank you for being part of this journey. Every order, kind
                message, share, recommendation, and every person who believed in us has meant more
                than you know.
              </p>

              <p>
                We started Zarish with a dream, and today, we carry it with gratitude. Every order
                reminds us that something we built with love has found a place in someone else’s
                life. As we continue to grow, we’re grateful to have you with us. Thank you for
                being a part of our Zarish story.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-[#F0E6DC]">
              <p className="font-serif italic text-sm text-[#7B5B3A]">With love,</p>
              <p className="font-display text-lg sm:text-xl font-bold text-[#2C1D13] mt-0.5">
                Nehala Mufeed
              </p>
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#8C7B6B] font-semibold mt-0.5">
                Founder, Zarish
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-[#2C1D13] text-white text-xs sm:text-sm font-medium tracking-wider uppercase rounded-xl hover:bg-[#7B5B3A] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Shop now
              </Link>
            </div>
          </div>
        </div>

        {/* Brand Narrative Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 items-center mb-20 pt-8 border-t border-[#EBDCD0]">
          <div className="relative w-full h-[320px] sm:h-[360px] md:h-[380px] rounded-2xl overflow-hidden border border-[#EBDCD0]">
            <Image
              src="/zarish.png"
              alt="ZARISH by Nehala Mufeed"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2C1D13] mb-3">
              Designed with Purpose
            </h2>
            <p className="text-xs sm:text-sm text-[#8C7B6B] leading-relaxed mb-3">
              Born from a passion for timeless modest aesthetics, <strong className="text-[#2C1D13]">ZARISH</strong> bridges traditional grace and modern minimalism. We believe that what you wear should make you feel effortlessly poised, comfortable, and true to your values.
            </p>
            <p className="text-xs sm:text-sm text-[#8C7B6B] leading-relaxed mb-5">
              Every collection is thoughtfully curated — from the selection of breathable Korean and Arabian nida fabrics to delicate cuff embroidery, precision seam lines, and flattering drape silhouettes that move with you throughout your day.
            </p>

            <Link href="/collections" className="inline-flex items-center justify-center font-medium tracking-wide uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-xs sm:text-sm px-6 py-2.5 sm:px-7 sm:py-3 bg-[#3D2B1F] text-white hover:bg-[#7B5B3A] hover:-translate-y-0.5 hover:shadow-md">
              Explore Our Collections
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
              <p className="text-xs text-[#8C7B6B] leading-relaxed">
                We work directly with textile artisans to source premium nida, modal, silk crepes, and lightweight chiffons that withstand everyday wear while maintaining luxurious texture.
              </p>
            </div>

            <div className="p-8 bg-[#FBF6F0] rounded-2xl border border-[#EBDCD0]">
              <span className="font-display text-3xl text-[#7B5B3A] font-bold">02</span>
              <h3 className="font-display text-xl font-semibold text-[#2C1D13] my-3">
                Proportion & Sizing
              </h3>
              <p className="text-xs text-[#8C7B6B] leading-relaxed">
                Every modest silhouette requires thoughtful balance. We provide extensive sizing options and custom-tailoring consultations to celebrate every woman&apos;s height and fit.
              </p>
            </div>

            <div className="p-8 bg-[#FBF6F0] rounded-2xl border border-[#EBDCD0]">
              <span className="font-display text-3xl text-[#7B5B3A] font-bold">03</span>
              <h3 className="font-display text-xl font-semibold text-[#2C1D13] my-3">
                Personal Connection
              </h3>
              <p className="text-xs text-[#8C7B6B] leading-relaxed">
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
