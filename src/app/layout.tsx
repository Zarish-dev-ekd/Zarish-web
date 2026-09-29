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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zarishbynehalamufeed.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: 'ZARISH by Nehala Mufeed | Premium Modest Fashion & Designer Co-ords',
    template: '%s | ZARISH by Nehala Mufeed',
  },
  description:
    'Discover exquisite modest fashion by ZARISH by Nehala Mufeed. Shop luxury designer co-ord sets, abayas, elegant party wear, and graceful everyday modest clothing. Crafted with timeless aesthetics, premium fabrics, and dispatched across India & worldwide.',
  keywords: [
    'ZARISH by Nehala Mufeed',
    'ZARISH',
    'Zarish fashion',
    'Nehala Mufeed',
    'Nehala Mufeed modest wear',
    'modest fashion India',
    'luxury co-ord sets women',
    'designer abayas Kerala',
    'modest party wear dresses',
    'premium modest clothing online',
    'hijabi boutique India',
    'modest kurta and coord sets',
    'zarishbynehalamufeed.com',
    'www.zarishbynehalamufeed.com',
    'Calicut modest wear designer',
    'modest fashion brand Kerala',
    'contemporary modest wear',
    'modest dresses worldwide delivery',
  ],
  authors: [{ name: 'Nehala Mufeed', url: siteUrl }],
  creator: 'Nehala Mufeed',
  publisher: 'ZARISH by Nehala Mufeed',
  category: 'Fashion & Apparel',
  applicationName: 'ZARISH by Nehala Mufeed',

  // ── Canonical & alternates ──────────────────────────────────
  alternates: {
    canonical: 'https://www.zarishbynehalamufeed.com',
  },

  // ── Verification (Google Search Console) ───────────────────
  verification: {
    google: 'eUt4QsjirkxOIAUDlcVfqWtmTtXmkQGNuJb41Ck-O2w',
  },

  // ── Icons / Favicon ─────────────────────────────────────────
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },

  // ── Web App Manifest ────────────────────────────────────────
  manifest: '/manifest.json',

  // ── Open Graph ──────────────────────────────────────────────
  openGraph: {
    title: 'ZARISH by Nehala Mufeed | Premium Modest Fashion & Designer Co-ords',
    description:
      'Shop luxury modest wear, designer co-ord sets, abayas & elegant party wear handcrafted with love. Delivered across India & worldwide.',
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
      'Luxury modest wear, designer co-ord sets & graceful pieces crafted with timeless elegance.',
    images: ['/og-image.jpg'],
    creator: '@zarishbynehala',
    site: '@zarishbynehala',
  },

  // ── Robots ──────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
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
        {/* Google Search Console Verification Meta Tag */}
        <meta name="google-site-verification" content="eUt4QsjirkxOIAUDlcVfqWtmTtXmkQGNuJb41Ck-O2w" />
        
        {/* Canonical link tag */}
        <link rel="canonical" href="https://www.zarishbynehalamufeed.com" />

        {/* Brand Favicons & Touch Icons (Multi-size for Desktop, Mobile & Googlebot) */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon-precomposed" sizes="180x180" href="/apple-touch-icon-precomposed.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* DNS Prefetch & Preconnect for maximum Core Web Vitals performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('zarish_intro_seen')==='true'){var s=document.createElement('style');s.id='zarish-suppress-intro';s.textContent='#zarish-preintro{display:none!important}';document.head.appendChild(s);}}catch(e){}`,
          }}
        />

        {/* ─── Heavy Level Organic Schema.org JSON-LD Markups ─── */}
        {/* 1. Store / Brand Knowledge Graph Entity */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['ClothingStore', 'OnlineStore'],
              '@id': 'https://www.zarishbynehalamufeed.com/#store',
              name: 'ZARISH by Nehala Mufeed',
              alternateName: [
                'ZARISH',
                'Zarish Fashion',
                'Zarish by Nehala',
                'Zarish Modest Wear',
              ],
              url: 'https://www.zarishbynehalamufeed.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://www.zarishbynehalamufeed.com/logo-zarish.png',
                width: 500,
                height: 160,
              },
              image: 'https://www.zarishbynehalamufeed.com/og-image.jpg',
              description:
                'Premium modest fashion brand by Nehala Mufeed — luxury co-ord sets, abayas, party wear, and graceful everyday modest pieces crafted with love.',
              founder: {
                '@type': 'Person',
                name: 'Nehala Mufeed',
                jobTitle: 'Founder & Creative Director',
                sameAs: 'https://www.instagram.com/zarish_bynehala',
              },
              address: {
                '@type': 'PostalAddress',
                addressRegion: 'Kerala',
                addressCountry: 'IN',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+919562292945',
                contactType: 'customer service',
                areaServed: ['IN', 'AE', 'SA', 'QA', 'KW', 'OM', 'BH', 'GB', 'US'],
                availableLanguage: ['English', 'Malayalam', 'Hindi'],
              },
              sameAs: [
                'https://www.instagram.com/zarish_bynehala',
              ],
              priceRange: '₹₹',
              currenciesAccepted: 'INR',
              paymentAccepted: 'Credit Card, Debit Card, UPI, Net Banking, Razorpay',
              hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'IN',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 7,
                returnMethod: 'https://schema.org/ReturnByMail',
                returnFees: 'https://schema.org/FreeReturn',
              },
            }),
          }}
        />

        {/* 2. WebSite Schema with Sitelinks Searchbox */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': 'https://www.zarishbynehalamufeed.com/#website',
              url: 'https://www.zarishbynehalamufeed.com',
              name: 'ZARISH by Nehala Mufeed',
              alternateName: 'ZARISH',
              publisher: {
                '@id': 'https://www.zarishbynehalamufeed.com/#store',
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://www.zarishbynehalamufeed.com/products?search={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* 3. Site Navigation Elements for Google Sitelinks */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: [
                {
                  '@type': 'SiteNavigationElement',
                  position: 1,
                  name: 'Shop All Garments',
                  url: 'https://www.zarishbynehalamufeed.com/products',
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 2,
                  name: 'New Arrivals',
                  url: 'https://www.zarishbynehalamufeed.com/collections/new-arrivals',
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 3,
                  name: 'Designer Collections',
                  url: 'https://www.zarishbynehalamufeed.com/collections',
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 4,
                  name: 'Shop by Size',
                  url: 'https://www.zarishbynehalamufeed.com/shop-by-size',
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 5,
                  name: 'About Nehala Mufeed',
                  url: 'https://www.zarishbynehalamufeed.com/about',
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 6,
                  name: 'Track Order',
                  url: 'https://www.zarishbynehalamufeed.com/track-order',
                },
              ],
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
