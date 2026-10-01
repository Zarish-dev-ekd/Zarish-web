'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { IconArrowRight, IconMenu, IconX } from '@/components/icons';

const adminNav = [
  { label: 'Overview', href: '/admin', icon: '📊' },
  { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { label: 'Orders', href: '/admin/orders', icon: '📦' },
  { label: 'Comments', href: '/admin/comments', icon: '💬' },
  { label: 'Coupons', href: '/admin/coupons', icon: '🏷️' },
  { label: 'Products', href: '/admin/products', icon: '👗' },
  { label: 'Categories', href: '/admin/categories', icon: '🗂️' },
  { label: 'Size & Color', href: '/admin/sizes', icon: '📏' },
  { label: 'Hero Banner', href: '/admin/hero', icon: '🖼️' },
  { label: 'Brand Story', href: '/admin/brand-story', icon: '📖' },
  { label: 'Announcements', href: '/admin/announcements', icon: '📢' },
  { label: 'Benefits', href: '/admin/benefits', icon: '✨' },
  { label: 'Store Policies', href: '/admin/policies', icon: '📜' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
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
    ) || { label: 'Admin', icon: '⚡' };

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
          <span className="text-[11px] font-semibold text-[#D4AF37] bg-white/[0.08] px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
            <span>{activeItem.icon}</span>
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
                        <span className="text-base">{item.icon}</span>
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

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 no-underline ${
                      isActive
                        ? 'bg-[#7B5B3A] text-white font-semibold'
                        : 'text-[#E5DACF] hover:bg-[#3E3024] hover:text-white'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
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
