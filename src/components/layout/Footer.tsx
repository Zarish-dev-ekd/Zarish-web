'use client';

import { useState } from 'react';
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
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };

  const whatsappHref = socialLinks.whatsapp
    ? (socialLinks.whatsapp.startsWith('http') ? socialLinks.whatsapp : `https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, '')}`)
    : 'https://wa.me/';

  return (
    <footer className="relative bg-[#0D0A08] text-[#E8DDD4] border-t border-[#2A1F16]" role="contentinfo">
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
                  style={{ height: '30px', width: 'auto', filter: 'brightness(0) invert(1)' }}
                />
              </Link>

              <p className="text-xs text-[#9E8E7E] leading-relaxed max-w-sm mb-3.5">
                {brandDescription ||
                  'ZARISH by Nehala Mufeed celebrates modesty as effortless grace. Thoughtfully tailored silhouettes designed for your sacred moments and everyday confidence.'}
              </p>

              {/* WhatsApp Styling Concierge Box */}
   
            </div>

            {/* Social Icons */}
            <div>
              <p className="text-[9px] font-semibold tracking-widest text-[#7A6A5A] uppercase mb-1.5">
                Connect With Us
              </p>
              <div className="flex items-center gap-2">
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-[#2E2218] bg-[#1A1209] flex items-center justify-center text-[#9E8E7E] hover:text-[#C9B49A] hover:border-[#C9B49A] transition-all"
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
                    className="w-8 h-8 rounded-full border border-[#2E2218] bg-[#1A1209] flex items-center justify-center text-[#9E8E7E] hover:text-[#C9B49A] hover:border-[#C9B49A] transition-all"
                    aria-label="Follow us on Facebook"
                  >
                    <IconFacebook size={14} />
                  </a>
                )}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-[#2E2218] bg-[#1A1209] flex items-center justify-center text-[#9E8E7E] hover:text-[#4CAF86] hover:border-[#4CAF86] transition-all"
                  aria-label="Chat on WhatsApp"
                >
                  <IconWhatsapp size={14} />
                </a>
                {socialLinks.email && (
                  <a
                    href={`mailto:${socialLinks.email}`}
                    className="w-8 h-8 rounded-full border border-[#2E2218] bg-[#1A1209] flex items-center justify-center text-[#9E8E7E] hover:text-[#C9B49A] hover:border-[#C9B49A] transition-all"
                    aria-label="Email us"
                  >
                    <IconMail size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Accordion (Visible on Mobile only) */}
          <div className="md:hidden border-t border-[#2E2218] divide-y divide-[#2E2218] mt-2">
            {FOOTER_COLUMNS.map((column) => {
              const isOpen = openSection === column.title;
              return (
                <div key={column.title} className="py-1">
                  <button
                    type="button"
                    onClick={() => toggleSection(column.title)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-[#C9B49A] cursor-pointer focus:outline-hidden"
                  >
                    <span>{column.title}</span>
                    <svg
                      className={`w-4 h-4 text-[#8C7B6B] transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#C9B49A]' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'grid-rows-[1fr] opacity-100 pb-3' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <ul className="flex flex-col space-y-2.5 pl-1 pt-1">
                        {column.links.map((link) => (
                          <li key={link.label}>
                            <Link
                              href={link.href}
                              className="block text-xs text-[#9E8E7E] hover:text-[#C9B49A] transition-colors py-0.5"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Navigation Columns (Hidden on Mobile, visible md and up) */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="hidden md:flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C9B49A] mb-2.5 pb-1 border-b border-[#2E2218] inline-block">
                {column.title}
              </h3>
              <ul className="flex flex-col space-y-1.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center text-xs text-[#7A6A5A] hover:text-[#C9B49A] transition-colors"
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
        <div className="pt-5 border-t border-[#2E2218] flex flex-col items-center justify-center gap-1.5 text-center">
          <p className="text-[11px] text-[#FFFF]">
            © {currentYear} ZARISH by Nehala Mufeed. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-medium tracking-wider uppercase text-[#FFFF]">
            <span>UPI</span>
            <span>•</span>
            <span>Cards</span>
            <span>•</span>
            <span>Net Banking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
