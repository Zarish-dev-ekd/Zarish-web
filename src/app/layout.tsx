import type { Metadata, Viewport } from 'next';
import { Cinzel, Playfair_Display, Inter, Alex_Brush } from 'next/font/google';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import PreIntro from '@/components/common/PreIntro';
import NavigationProgress from '@/components/common/NavigationProgress';
import { WishlistProvider } from '@/context/WishlistContext';
import WishlistDrawer from '@/components/wishlist/WishlistDrawer';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import Chatbot from '@/components/common/Chatbot';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const alexBrush = Alex_Brush({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-alex-brush',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zarish.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: 'ZARISH by Nehala Mufeed | Premium Modest Fashion',
    template: '%s | ZARISH',
  },
  description:
    'Discover elegant modest fashion by ZARISH by Nehala Mufeed. Premium co-ord sets, party wear, and graceful everyday pieces — crafted with love, made to be remembered.',
  keywords: [
    'modest fashion India',
    'ZARISH by Nehala Mufeed',
    'co-ord sets',
    'modest wear Kerala',
    'premium modest fashion',
    'party wear women',
    'ethnic wear online',
    'modest kurta sets',
    'zarish.in',
    'Nehala Mufeed',
  ],
  authors: [{ name: 'Nehala Mufeed', url: siteUrl }],
  creator: 'Nehala Mufeed',
  publisher: 'ZARISH',
  category: 'Fashion & Apparel',

  // ── Canonical & alternates ──────────────────────────────────
  alternates: {
    canonical: '/',
  },

  // ── Icons / Favicon ─────────────────────────────────────────
  icons: {
    icon: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },

  // ── Web App Manifest ────────────────────────────────────────
  manifest: '/manifest.json',

  // ── Open Graph ──────────────────────────────────────────────
  openGraph: {
    title: 'ZARISH by Nehala Mufeed | Premium Modest Fashion',
    description:
      'Discover elegant modest fashion by ZARISH. Premium co-ord sets, party wear & everyday graceful pieces — crafted with love, made to be remembered.',
    url: siteUrl,
    siteName: 'ZARISH by Nehala Mufeed',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ZARISH by Nehala Mufeed — Premium Modest Fashion',
        type: 'image/jpeg',
      },
    ],
  },

  // ── Twitter / X Card ────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'ZARISH by Nehala Mufeed | Premium Modest Fashion',
    description:
      'Premium co-ord sets, party wear & everyday graceful pieces — crafted with love.',
    images: ['/og-image.jpg'],
    creator: '@zarishbynehalamufeed',
    site: '@zarishbynehalamufeed',
  },

  // ── Robots ──────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  // ── Verification ─────────────────────────────────────────────
  // Add your Google Search Console verification token here when ready:
  // verification: { google: 'YOUR_GOOGLE_VERIFICATION_TOKEN' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${cinzel.variable} ${playfair.variable} ${inter.variable} ${alexBrush.variable} bg-white`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('zarish_intro_seen')==='true'){var s=document.createElement('style');s.id='zarish-suppress-intro';s.textContent='#zarish-preintro{display:none!important}';document.head.appendChild(s);}}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ClothingStore',
              name: 'ZARISH by Nehala Mufeed',
              url: 'https://zarish.in',
              logo: 'https://zarish.in/logo-zarish.png',
              image: 'https://zarish.in/og-image.jpg',
              description:
                'Premium modest fashion brand by Nehala Mufeed — co-ord sets, party wear, and everyday graceful pieces.',
              founder: {
                '@type': 'Person',
                name: 'Nehala Mufeed',
              },
              address: {
                '@type': 'PostalAddress',
                addressRegion: 'Kerala',
                addressCountry: 'IN',
              },
              sameAs: [
                'https://www.instagram.com/zarish_bynehala',
              ],
              priceRange: '₹₹',
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-white">
        <NavigationProgress />
        <CartProvider>
          <WishlistProvider>
            <PreIntro />
            <WishlistDrawer />
            <CartDrawer />
            <Chatbot />
            {children}
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
