'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { IconArrowRight } from '@/components/icons';

const adminNav = [
  { label: 'Overview', href: '/admin', icon: 'dashboard' },
  { label: 'Orders', href: '/admin/orders', icon: 'truck' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'tag' },
  { label: 'Products', href: '/admin/products', icon: 'bag' },
  { label: 'Categories', href: '/admin/categories', icon: 'package' },
  { label: 'Size & Color', href: '/admin/sizes', icon: 'size' },
  { label: 'Hero Banner', href: '/admin/hero', icon: 'image' },
  { label: 'Brand Story', href: '/admin/brand-story', icon: 'heart' },
  { label: 'Announcements', href: '/admin/announcements', icon: 'truck' },
  { label: 'Benefits', href: '/admin/benefits', icon: 'shield' },
  { label: 'Store Policies', href: '/admin/policies', icon: 'file' },
  { label: 'Settings', href: '/admin/settings', icon: 'settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] bg-[#2B2118] text-[#E5DACF] flex flex-col flex-shrink-0 sticky top-0 h-screen border-r border-white/10 z-30 max-md:w-full max-md:h-auto max-md:relative">
      <div className="px-5 py-6 border-b border-white/10 flex items-center justify-center">
        <Link href="/admin" className="flex items-center justify-center no-underline w-full">
          <Image
            src="/logo-zarish.png"
            alt="ZARISH Admin"
            width={120}
            height={40}
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
          View Live Storefront <IconArrowRight size={14} />
        </Link>
      </div>
    </aside>
  );
}
