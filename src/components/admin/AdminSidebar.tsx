'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { IconArrowRight, IconMenu, IconX } from '@/components/icons';

interface IconProps {
  className?: string;
  size?: number;
}

// ─── Luxury Minimalist Admin SVG Icons (Stroke 1.75) ───
function IconDashboard({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function IconAnalytics({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function IconOrders({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconComments({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="13" y2="13" />
    </svg>
  );
}

function IconCoupons({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  );
}

function IconProducts({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconCategories({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconSizes({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.3 8.7L8.7 21.3a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.4L13.9 1.3a1 1 0 0 1 1.4 0l6 6a1 1 0 0 1 0 1.4z" />
      <line x1="14.5" y1="4.5" x2="12.5" y2="6.5" />
      <line x1="11.5" y1="7.5" x2="8.5" y2="10.5" />
      <line x1="8.5" y1="10.5" x2="6.5" y2="12.5" />
      <line x1="5.5" y1="13.5" x2="2.5" y2="16.5" />
    </svg>
  );
}

function IconHero({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <circle cx="7.5" cy="9.5" r="1.5" />
      <polyline points="22 14 16 9 5 17" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  );
}

function IconBrandStory({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function IconAnnouncements({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconBenefits({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z" />
    </svg>
  );
}

function IconPolicies({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconSettings({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

interface NavItem {
  label: string;
  href: string;
  Icon: React.ComponentType<IconProps>;
}

const adminNav: NavItem[] = [
  { label: 'Overview', href: '/admin', Icon: IconDashboard },
  { label: 'Analytics', href: '/admin/analytics', Icon: IconAnalytics },
  { label: 'Orders', href: '/admin/orders', Icon: IconOrders },
  { label: 'Comments', href: '/admin/comments', Icon: IconComments },
  { label: 'Coupons', href: '/admin/coupons', Icon: IconCoupons },
  { label: 'Products', href: '/admin/products', Icon: IconProducts },
  { label: 'Categories', href: '/admin/categories', Icon: IconCategories },
  { label: 'Size & Color', href: '/admin/sizes', Icon: IconSizes },
  { label: 'Hero Banner', href: '/admin/hero', Icon: IconHero },
  { label: 'Brand Story', href: '/admin/brand-story', Icon: IconBrandStory },
  { label: 'Announcements', href: '/admin/announcements', Icon: IconAnnouncements },
  { label: 'Benefits', href: '/admin/benefits', Icon: IconBenefits },
  { label: 'Store Policies', href: '/admin/policies', Icon: IconPolicies },
  { label: 'Settings', href: '/admin/settings', Icon: IconSettings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const activeItem =
    adminNav.find((item) =>
      item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
    ) || { label: 'Admin', Icon: IconDashboard };

  const ActiveIcon = activeItem.Icon;

  return (
    <>
      {/* ─── Mobile Sticky Top Bar (< md) ─── */}
      <div className="md:hidden sticky top-0 z-40 bg-[#2B2118] text-[#E5DACF] h-14 px-3.5 flex items-center justify-between border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Link href="/admin" className="flex items-center no-underline">
            <Image
              src="/logo-zarish.png"
              alt="ZARISH"
              width={90}
              height={28}
              style={{ width: 'auto', height: 'auto' }}
              className="object-contain brightness-0 invert"
              priority
            />
          </Link>
          <span className="text-[11px] font-semibold text-[#D4AF37] bg-white/[0.08] px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5">
            <ActiveIcon size={12} className="text-[#D4AF37]" />
            <span>{activeItem.label}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="px-2.5 py-1 text-xs text-[#E5DACF] hover:text-white bg-white/[0.08] rounded-md transition-colors font-medium flex items-center gap-1"
            title="Live Storefront"
          >
            <span>Store</span>
            <IconArrowRight size={11} />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 text-white bg-white/[0.1] hover:bg-white/[0.18] rounded-lg transition-colors flex items-center justify-center cursor-pointer active:scale-95"
            aria-label={mobileOpen ? 'Close Menu' : 'Open Admin Menu'}
          >
            {mobileOpen ? <IconX size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </div>

      {/* ─── Mobile Slide-out Drawer ─── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-[280px] max-w-[85vw] bg-[#2B2118] text-[#E5DACF] h-full flex flex-col shadow-2xl border-r border-white/10 z-10 animate-in slide-in-from-left duration-200">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <Link
                href="/admin"
                className="flex items-center no-underline"
                onClick={() => setMobileOpen(false)}
              >
                <Image
                  src="/logo-zarish.png"
                  alt="ZARISH"
                  width={110}
                  height={34}
                  style={{ width: 'auto', height: 'auto' }}
                  className="object-contain brightness-0 invert"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-[#E5DACF] hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label="Close menu"
              >
                <IconX size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Admin Navigation">
              <ul className="list-none p-0 m-0 flex flex-col gap-1">
                {adminNav.map((item) => {
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href);
                  const ItemIcon = item.Icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all no-underline ${
                          isActive
                            ? 'bg-[#7B5B3A] text-white font-semibold shadow-xs'
                            : 'text-[#E5DACF] hover:bg-[#3E3024] hover:text-white'
                        }`}
                      >
                        <span
                          className={`flex items-center justify-center ${
                            isActive ? 'text-[#D4AF37]' : 'text-[#B8A494]'
                          }`}
                        >
                          <ItemIcon size={18} />
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t border-white/10 flex flex-col gap-2">
              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-white/[0.08] text-white text-xs font-medium no-underline hover:bg-white/[0.15] transition-colors"
              >
                <span>View Live Storefront</span>
                <IconArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── Desktop Sticky Sidebar (>= md) ─── */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#2B2118] text-[#E5DACF] flex-shrink-0 sticky top-0 h-screen border-r border-white/10 z-30">
        <div className="px-5 py-6 border-b border-white/10 flex items-center justify-center">
          <Link href="/admin" className="flex items-center justify-center no-underline w-full">
            <Image
              src="/logo-zarish.png"
              alt="ZARISH Admin"
              width={120}
              height={40}
              style={{ width: 'auto', height: 'auto' }}
              className="object-contain brightness-0 invert mx-auto"
              priority
            />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin Navigation">
          <ul className="list-none p-0 m-0 flex flex-col gap-1">
            {adminNav.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              const ItemIcon = item.Icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 no-underline group ${
                      isActive
                        ? 'bg-[#7B5B3A] text-white font-semibold shadow-xs'
                        : 'text-[#E5DACF] hover:bg-[#3E3024] hover:text-white'
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center transition-colors duration-200 ${
                        isActive ? 'text-[#D4AF37]' : 'text-[#B8A494] group-hover:text-white'
                      }`}
                    >
                      <ItemIcon size={18} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-md bg-white/[0.06] text-white text-[13px] no-underline transition-colors duration-200 hover:bg-white/[0.12]"
          >
            <span>View Live Storefront</span>
            <IconArrowRight size={14} />
          </Link>
        </div>
      </aside>
    </>
  );
}
