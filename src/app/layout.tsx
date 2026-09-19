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
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
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

export const metadata: Metadata = {
  title: 'ZARISH by Nehala Mufeed | Premium Modest Fashion',
  description:
    'Discover elegant modest fashion by ZARISH. Graceful pieces for your everyday and special moments. Premium quality co-ord sets, party wear, and more.',
  keywords: ['modest fashion', 'ZARISH', 'Nehala Mufeed', 'co-ord sets', 'modest wear', 'premium fashion', 'Kerala fashion'],
  openGraph: {
    title: 'ZARISH by Nehala Mufeed | Premium Modest Fashion',
    description:
      'Discover elegant modest fashion by ZARISH. Graceful pieces for your everyday and special moments.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'ZARISH by Nehala Mufeed',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZARISH by Nehala Mufeed | Premium Modest Fashion',
    description:
      'Discover elegant modest fashion by ZARISH. Graceful pieces for your everyday and special moments.',
  },
  robots: {
    index: true,
    follow: true,
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
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('zarish_intro_seen')==='true'){var s=document.createElement('style');s.id='zarish-suppress-intro';s.textContent='#zarish-preintro{display:none!important}';document.head.appendChild(s);}}catch(e){}`,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-white">
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
