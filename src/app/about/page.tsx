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

      <main className="container" style={{ paddingTop: '48px', paddingBottom: '96px' }}>
        {/* Story Hero */}
        <div style={{ maxWidth: '800px', margin: '0 auto 64px auto', textAlign: 'center' }}>
          <span
            style={{
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              fontWeight: 600,
            }}
          >
            OUR ESSENCE
          </span>
          <h1 className="heading-1" style={{ margin: '12px 0 20px 0', fontSize: '38px' }}>
            Beauty in Modesty
          </h1>
          <p
            className="body-lg"
            style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontStyle: 'italic' }}
          >
            &ldquo;Modesty is not about hiding; it is about revealing your inherent grace with confidence, dignity, and effortless luxury.&rdquo;
          </p>
          <p style={{ marginTop: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>
            — Nehala Mufeed, Founder & Creative Director
          </p>
        </div>

        {/* Brand Narrative Block */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px',
            alignItems: 'center',
            marginBottom: '80px',
          }}
        >
          <div style={{ position: 'relative', height: '440px', borderRadius: '12px', overflow: 'hidden', background: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
            <Image
              src="/logo-zarish.png"
              alt="ZARISH by Nehala Mufeed"
              width={260}
              height={90}
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div>
            <h2 className="heading-2" style={{ marginBottom: '16px' }}>
              Designed with Purpose
            </h2>
            <p className="body-md" style={{ color: 'var(--color-muted)', lineHeight: '1.8', marginBottom: '16px' }}>
              Born from a passion for timeless modest aesthetics, <strong>ZARISH</strong> bridges traditional grace and modern minimalism. We believe that what you wear should make you feel effortlessly poised, comfortable, and true to your values.
            </p>
            <p className="body-md" style={{ color: 'var(--color-muted)', lineHeight: '1.8', marginBottom: '24px' }}>
              Every collection is thoughtfully curated — from the selection of breathable Korean and Arabian nida fabrics to delicate cuff embroidery, precision seam lines, and flattering drape silhouettes that move with you throughout your day.
            </p>

            <Link href="/products" className="btn btn--primary">
              Explore Our Creations <IconArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 3 Pillars */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="heading-2">The ZARISH Pillars</h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '32px',
            }}
          >
            <div style={{ padding: '32px 24px', background: 'var(--color-cream)', borderRadius: '8px' }}>
              <span style={{ fontSize: '28px', color: 'var(--color-primary)', fontWeight: 700 }}>01</span>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', margin: '12px 0 8px 0' }}>
                Uncompromised Fabrics
              </h3>
              <p className="body-sm" style={{ color: 'var(--color-muted)', lineHeight: '1.6' }}>
                We work directly with textile artisans to source premium nida, modal, silk crepes, and lightweight chiffons that withstand everyday wear while maintaining luxurious texture.
              </p>
            </div>

            <div style={{ padding: '32px 24px', background: 'var(--color-cream)', borderRadius: '8px' }}>
              <span style={{ fontSize: '28px', color: 'var(--color-primary)', fontWeight: 700 }}>02</span>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', margin: '12px 0 8px 0' }}>
                Proportion & Sizing
              </h3>
              <p className="body-sm" style={{ color: 'var(--color-muted)', lineHeight: '1.6' }}>
                Every modest silhouette requires thoughtful balance. We provide extensive sizing options and custom-tailoring consultations to celebrate every woman&apos;s height and fit.
              </p>
            </div>

            <div style={{ padding: '32px 24px', background: 'var(--color-cream)', borderRadius: '8px' }}>
              <span style={{ fontSize: '28px', color: 'var(--color-primary)', fontWeight: 700 }}>03</span>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', margin: '12px 0 8px 0' }}>
                Personal Connection
              </h3>
              <p className="body-sm" style={{ color: 'var(--color-muted)', lineHeight: '1.6' }}>
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
