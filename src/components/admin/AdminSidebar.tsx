'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  IconShoppingBag,
  IconPackage,
  IconGlobe,
  IconTruck,
  IconUser,
  IconArrowRight,
} from '@/components/icons';

const adminNav = [
  { label: 'Overview', href: '/admin', icon: 'dashboard' },
  { label: 'Orders', href: '/admin/orders', icon: 'truck' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'tag' },
  { label: 'Products', href: '/admin/products', icon: 'bag' },
  { label: 'Categories', href: '/admin/categories', icon: 'package' },
  { label: 'Sizes', href: '/admin/sizes', icon: 'size' },
  { label: 'Hero Banner', href: '/admin/hero', icon: 'image' },
  { label: 'Media Library', href: '/admin/media', icon: 'image' },
  { label: 'Announcements', href: '/admin/announcements', icon: 'truck' },
  { label: 'Benefits', href: '/admin/benefits', icon: 'shield' },
  { label: 'Settings', href: '/admin/settings', icon: 'settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <Link href="/admin" className="admin-sidebar__logo-link">
          <Image
            src="/logo-zarish.png"
            alt="ZARISH Admin"
            width={120}
            height={40}
            className="admin-sidebar__logo"
            priority
          />
          <span className="admin-sidebar__badge">ADMIN</span>
        </Link>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Admin Navigation">
        <ul className="admin-sidebar__list">
          {adminNav.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <li key={item.href} className="admin-sidebar__item">
                <Link
                  href={item.href}
                  className={`admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}
                >
                  <span className="admin-sidebar__link-text">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="admin-sidebar__footer">
        <Link href="/" target="_blank" className="admin-sidebar__storefront-btn">
          View Live Storefront <IconArrowRight size={14} />
        </Link>
      </div>
    </aside>
  );
}
