'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { NavigationItem } from '@/lib/types';
import { IconSearch, IconUser, IconHeart, IconShoppingBag, IconMenu, IconX, IconChevronRight } from '@/components/icons';

interface HeaderProps {
  navigationItems: NavigationItem[];
  cartItemCount: number;
}

export default function Header({ navigationItems, cartItemCount }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Monitor Auth State
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser(authUser);
    }
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Click outside to close account dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccountMenuOpen(false);
    router.push('/');
    router.refresh();
  };

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

            {/* Profile Action with Auth Dropdown / Direct Link */}
            <div className="relative" ref={menuRef}>
              {user ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="header__action-btn header__action-btn--account relative"
                    aria-label="My Account"
                    title={`Signed in as ${user.email}`}
                  >
                    <IconUser />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#0E7064] ring-2 ring-white" />
                  </button>

                  {accountMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 8px)',
                        width: '220px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(44,29,19,0.12)',
                        border: '1px solid #E2D5C7',
                        padding: '12px 8px',
                        zIndex: 50,
                      }}
                    >
                      <div
                        style={{
                          padding: '4px 12px 8px 12px',
                          borderBottom: '1px solid #F0EBE5',
                          marginBottom: '6px',
                        }}
                      >
                        <span style={{ fontSize: '11px', color: '#8C7B6B', display: 'block' }}>
                          Signed in as
                        </span>
                        <strong
                          style={{
                            fontSize: '12px',
                            color: '#2C1D13',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {user.user_metadata?.full_name || user.email}
                        </strong>
                      </div>

                      <Link
                        href="/account"
                        onClick={() => setAccountMenuOpen(false)}
                        style={{
                          display: 'block',
                          padding: '8px 12px',
                          fontSize: '12px',
                          color: '#2C1D13',
                          textDecoration: 'none',
                          borderRadius: '8px',
                        }}
                        className="hover:bg-[#FAF6F0]"
                      >
                        My Account & Orders
                      </Link>

                      <Link
                        href="/admin"
                        onClick={() => setAccountMenuOpen(false)}
                        style={{
                          display: 'block',
                          padding: '8px 12px',
                          fontSize: '12px',
                          color: '#7B5B3A',
                          fontWeight: 600,
                          textDecoration: 'none',
                          borderRadius: '8px',
                        }}
                        className="hover:bg-[#FAF6F0]"
                      >
                        Store Admin Portal
                      </Link>

                      <div
                        style={{
                          borderTop: '1px solid #F0EBE5',
                          marginTop: '6px',
                          paddingTop: '6px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={handleSignOut}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 12px',
                            fontSize: '12px',
                            color: '#C62828',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '8px',
                          }}
                          className="hover:bg-[#FFF1F2]"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="header__action-btn header__action-btn--account"
                  aria-label="Sign In or Register"
                  title="Sign In / Register"
                >
                  <IconUser />
                </Link>
              )}
            </div>

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

          <div className="mobile-drawer__section-title">
            {user ? `Account (${user.email?.split('@')[0]})` : 'Customer Account'}
          </div>

          {user ? (
            <>
              <Link href="/account" className="mobile-drawer__nav-link" onClick={closeDrawer}>
                My Account & Orders
                <IconChevronRight size={14} />
              </Link>
              <Link
                href="/admin"
                className="mobile-drawer__nav-link"
                onClick={closeDrawer}
                style={{ color: '#7B5B3A', fontWeight: 600 }}
              >
                Store Admin Portal
                <IconChevronRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  handleSignOut();
                }}
                className="mobile-drawer__nav-link"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  color: '#C62828',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="mobile-drawer__nav-link" onClick={closeDrawer}>
                Sign In
                <IconChevronRight size={14} />
              </Link>
              <Link
                href="/signup"
                className="mobile-drawer__nav-link"
                onClick={closeDrawer}
                style={{ color: '#7B5B3A', fontWeight: 600 }}
              >
                Create Account
                <IconChevronRight size={14} />
              </Link>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
