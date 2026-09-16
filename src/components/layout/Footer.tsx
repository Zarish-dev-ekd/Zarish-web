'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  IconInstagram,
  IconFacebook,
  IconWhatsapp,
  IconMail,
} from '@/components/icons';

interface FooterProps {
  footerGroups?: unknown;
  brandDescription?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    email?: string;
  };
}

const FOOTER_COLUMNS = [
  {
    title: 'Collections',
    links: [
      { label: 'New Arrivals', href: '/collections/new-arrivals' },
      { label: 'All Collections', href: '/collections' },
      { label: 'Shop by Size', href: '/shop-by-size' },
      { label: 'Modest Essentials', href: '/collections' },
      { label: 'Exclusive Offers', href: '/offers' },
    ],
  },
  {
    title: 'About Zarish',
    links: [
      { label: 'Our Story & Philosophy', href: '/about' },
      { label: 'By Nehala Mufeed', href: '/about' },
      { label: 'Quality & Craftsmanship', href: '/about' },
      { label: 'Size & Silhouette Guide', href: '/shop-by-size' },
    ],
  },
  {
    title: 'Client Experience',
    links: [
      { label: 'Bespoke Consultation', href: '/about' },
      { label: 'Shipping & Delivery', href: '/about' },
      { label: 'Exchange & Order Assistance', href: '/about' },
      { label: 'Account & Orders', href: '/account' },
    ],
  },
];

export default function Footer({ brandDescription, socialLinks = {} }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const whatsappHref = socialLinks.whatsapp
    ? (socialLinks.whatsapp.startsWith('http') ? socialLinks.whatsapp : `https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, '')}`)
    : 'https://wa.me/';

  return (
    <footer className="relative bg-[#FAF6F0] text-[#3D2B1F] border-t border-[#E2D5C7]" role="contentinfo">
      {/* ─── Main Footer Columns ────────────────────────────────────── */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 pt-8 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-6">
          {/* Brand & Story Column (2 cols wide on desktop) */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <Link href="/" className="inline-block mb-2.5" aria-label="ZARISH - Home">
                <Image
                  src="/logo-zarish.png"
                  alt="ZARISH by Nehala Mufeed"
                  width={140}
                  height={34}
                  style={{ height: '30px', width: 'auto' }}
                />
              </Link>

              <p className="text-xs text-[#6B5744] leading-relaxed max-w-sm mb-3.5">
                {brandDescription ||
                  'ZARISH by Nehala Mufeed celebrates modesty as effortless grace. Thoughtfully tailored silhouettes designed for your sacred moments and everyday confidence.'}
              </p>

              {/* WhatsApp Styling Concierge Box */}
              <div className="bg-[#F5EDE3] max-w-sm mb-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-wider text-[#2C1D13] uppercase">Need Styling Advice?</p>
                  <p className="text-[10px] text-[#7B6858]">Chat directly with our design team</p>
                </div>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2C1D13] hover:bg-[#3D2B1F] text-white rounded-full text-[10px] font-medium tracking-wide transition-all shadow-sm shrink-0"
                >
                  <IconWhatsapp size={12} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div>
              <p className="text-[9px] font-semibold tracking-widest text-[#7B5B3A] uppercase mb-1.5">
                Connect With Us
              </p>
              <div className="flex items-center gap-2">
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-[#E2D5C7] bg-[#FAF6F0] flex items-center justify-center text-[#6B5744] hover:text-[#8B4E5A] hover:border-[#8B4E5A] hover:bg-white transition-all shadow-2xs"
                    aria-label="Follow us on Instagram"
                  >
                    <IconInstagram size={14} />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-[#E2D5C7] bg-[#FAF6F0] flex items-center justify-center text-[#6B5744] hover:text-[#7B5B3A] hover:border-[#7B5B3A] hover:bg-white transition-all shadow-2xs"
                    aria-label="Follow us on Facebook"
                  >
                    <IconFacebook size={14} />
                  </a>
                )}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-[#E2D5C7] bg-[#FAF6F0] flex items-center justify-center text-[#6B5744] hover:text-[#0E7064] hover:border-[#0E7064] hover:bg-white transition-all shadow-2xs"
                  aria-label="Chat on WhatsApp"
                >
                  <IconWhatsapp size={14} />
                </a>
                {socialLinks.email && (
                  <a
                    href={`mailto:${socialLinks.email}`}
                    className="w-8 h-8 rounded-full border border-[#E2D5C7] bg-[#FAF6F0] flex items-center justify-center text-[#6B5744] hover:text-[#7B5B3A] hover:border-[#7B5B3A] hover:bg-white transition-all shadow-2xs"
                    aria-label="Email us"
                  >
                    <IconMail size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#2C1D13] mb-2.5 pb-1 border-b border-[#E2D5C7]/60 inline-block">
                {column.title}
              </h3>
              <ul className="flex flex-col space-y-1.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center text-xs text-[#6B5744] hover:text-[#7B5B3A] transition-colors"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ─── Bottom Bar ───────────────────────────────────────────── */}
        <div className="pt-5 border-t border-[#E2D5C7] flex flex-col items-center justify-center gap-1.5 text-center">
          <p className="text-[11px] text-[#8C7B6B]">
            © {currentYear} ZARISH by Nehala Mufeed. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-medium tracking-wider uppercase text-[#7B6858]">
            <span>UPI</span>

            <span>Cards</span>
    
            <span>Net Banking</span>
          
            <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
