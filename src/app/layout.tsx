import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
