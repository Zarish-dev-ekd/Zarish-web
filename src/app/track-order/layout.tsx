import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Order | ZARISH by Nehala Mufeed',
  description:
    'Track your ZARISH order, view live shipping status, courier AWB tracking details, and estimated delivery dates.',
  alternates: {
    canonical: 'https://www.zarishbynehalamufeed.com/track-order',
  },
  openGraph: {
    title: 'Track Your Order | ZARISH by Nehala Mufeed',
    description: 'Track your ZARISH order and delivery progress.',
    url: 'https://www.zarishbynehalamufeed.com/track-order',
    siteName: 'ZARISH by Nehala Mufeed',
  },
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
