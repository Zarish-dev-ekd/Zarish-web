'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { NavigationItem } from '@/lib/types';
import { IconSearch, IconUser, IconHeart, IconShoppingBag, IconMenu, IconX, IconChevronRight } from '@/components/icons';

interface HeaderProps {
  navigationItems: NavigationItem[];
  cartItemCount: number;
}

export default function Header({ navigationItems, cartItemCount }: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    document.body.style.overflow = '';
  }, []);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDrawerOpen, closeDrawer]);

  const activeNavItems = navigationItems.filter((n) => n.is_active);

  return (
    <>
      <header className="header" role="banner">
        <div className="header__inner">
          {/* Mobile Hamburger */}
          <button
            className="header__hamburger"
            onClick={openDrawer}
            aria-label="Open navigation menu"
            aria-expanded={isDrawerOpen}
          >
            <IconMenu />
          </button>

          {/* Logo */}
          <Link href="/" className="header__logo" aria-label="ZARISH - Home">
            <Image
              src="/logo-zarish.png"
              alt="ZARISH by Nehala Mufeed"
              width={160}
              height={40}
              priority
              style={{ height: '36px', width: 'auto' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="header__nav" aria-label="Main navigation">
            {activeNavItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="header__nav-link"
                {...(item.open_in_new_tab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="header__actions">
            <Link href="/search" className="header__action-btn" aria-label="Search garments">
              <IconSearch />
            </Link>
            <Link href="/admin" className="header__action-btn header__action-btn--account" aria-label="Store Management Portal">
              <IconUser />
            </Link>
            <Link href="/products?sale=true" className="header__action-btn header__action-btn--wishlist" aria-label="Special Offers">
              <IconHeart />
            </Link>
            <Link href="/products" className="header__action-btn" aria-label="All garments">
              <IconShoppingBag />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-drawer-overlay ${isDrawerOpen ? 'mobile-drawer-overlay--open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Mobile Drawer */}
      <aside
        className={`mobile-drawer ${isDrawerOpen ? 'mobile-drawer--open' : ''}`}
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
      >
        <div className="mobile-drawer__header">
          <Link href="/" className="header__logo" onClick={closeDrawer}>
            <Image
              src="/logo-zarish.png"
              alt="ZARISH by Nehala Mufeed"
              width={120}
              height={32}
              style={{ height: '28px', width: 'auto' }}
            />
          </Link>
          <button className="mobile-drawer__close" onClick={closeDrawer} aria-label="Close navigation menu">
            <IconX />
          </button>
        </div>

        <nav className="mobile-drawer__nav" aria-label="Mobile navigation">
          {activeNavItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="mobile-drawer__nav-link"
              onClick={closeDrawer}
            >
              {item.label}
              <IconChevronRight size={14} />
            </Link>
          ))}

          <div className="mobile-drawer__divider" />

          <div className="mobile-drawer__section-title">Account</div>
          <Link href="/account" className="mobile-drawer__nav-link" onClick={closeDrawer}>
            My Account
            <IconChevronRight size={14} />
          </Link>
          <Link href="/account/wishlist" className="mobile-drawer__nav-link" onClick={closeDrawer}>
            Wishlist
            <IconChevronRight size={14} />
          </Link>
          <Link href="/account/orders" className="mobile-drawer__nav-link" onClick={closeDrawer}>
            My Orders
            <IconChevronRight size={14} />
          </Link>
        </nav>
      </aside>
    </>
  );
}
