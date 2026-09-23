'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { NavigationItem } from '@/lib/types';
import { IconSearch, IconUser, IconHeart, IconShoppingBag, IconMenu, IconX, IconChevronRight, IconTruck } from '@/components/icons';
import AuthModal from '@/components/auth/AuthModal';
import SearchModal from '@/components/search/SearchModal';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

const FALLBACK_NAV_ITEMS: NavigationItem[] = [
  { id: 'nav-shop', label: 'Shop All', href: '/products', display_order: 1, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
  { id: 'nav-1', label: 'New Arrivals', href: '/collections/new-arrivals', display_order: 2, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
  { id: 'nav-2', label: 'Collections', href: '/collections', display_order: 3, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
  { id: 'nav-3', label: 'Shop by Size', href: '/shop-by-size', display_order: 4, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
  { id: 'nav-5', label: 'About Us', href: '/about', display_order: 5, is_active: true, parent_id: null, open_in_new_tab: false, icon: null, created_at: '', updated_at: '' },
];

interface HeaderProps {
  navigationItems?: NavigationItem[];
  cartItemCount?: number;
}

export default function Header({ navigationItems = [], cartItemCount = 0 }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { openWishlist, count: wishlistCount } = useWishlist();
  const { openCart, count: liveCartCount } = useCart();

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

  const [navItems, setNavItems] = useState<NavigationItem[]>(
    navigationItems && navigationItems.length > 0 ? navigationItems : FALLBACK_NAV_ITEMS
  );

  useEffect(() => {
    if (navigationItems && navigationItems.length > 0) {
      setNavItems(navigationItems);
    } else {
      supabase
        .from('navigation_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setNavItems(data as NavigationItem[]);
          }
        });
    }
  }, [navigationItems, supabase]);

  const activeNavItems = navItems.filter((n) => n.is_active);

  return (
    <>
      <header className="bg-[#FFFF] h-[72px] flex items-center border-b border-[#E2D5C7] sticky top-0 z-[100]" role="banner">
        <div className="flex items-center justify-between w-full max-w-[1280px] mx-auto px-4 md:px-8 max-md:grid max-md:grid-cols-[36px_1fr_auto] max-md:gap-4">
          {/* Mobile Hamburger */}
          <button
            className="hidden max-md:flex w-9 h-9 items-center justify-center text-[#2C1D13] [&>svg]:w-[22px] [&>svg]:h-[22px]"
            onClick={openDrawer}
            aria-label="Open navigation menu"
            aria-expanded={isDrawerOpen}
          >
            <IconMenu />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 flex items-center justify-center max-md:justify-center py-1"
            aria-label="ZARISH - Home"
          >
            <span className="relative inline-flex items-start">
              <Image
                src="/logo-zarish.png"
                alt="ZARISH by Nehala Mufeed"
                width={220}
                height={56}
                priority
                className="h-10 sm:h-11 md:h-12 w-auto max-w-[190px] sm:max-w-none object-contain transition-all"
              />
              <span className="text-[8px] sm:text-[9px] md:text-[10px] font-sans font-medium text-[#7B5B3A] select-none -translate-y-0.5 ml-0.5" aria-hidden="true">
                ™
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {activeNavItems.map((item) => {
              const isActive = item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative py-2 text-[11px] tracking-wide transition-colors uppercase after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#7B5B3A] after:transition-all after:duration-300 ${
                    isActive
                      ? 'text-[#2C1D13] font-semibold after:w-full'
                      : 'text-[#2C1D13] hover:text-[#7B5B3A] after:w-0 hover:after:w-full'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  {...(item.open_in_new_tab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-4 max-md:gap-2">
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F3ECE2] transition-colors text-[#2C1D13] [&>svg]:w-5 [&>svg]:h-5"
              aria-label="Search garments"
            >
              <IconSearch />
            </button>

            {/* Profile Action with Auth Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F3ECE2] transition-colors text-[#2C1D13] [&>svg]:w-5 [&>svg]:h-5 max-md:hidden"
                aria-label="My Account"
                aria-expanded={accountMenuOpen}
                title={user ? `Signed in as ${user.email}` : 'Sign In / Account'}
              >
                <IconUser />
                {user && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#0E7064] ring-2 ring-white" />
                )}
              </button>

              {accountMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '250px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    boxShadow: '0 16px 40px rgba(44,29,19,0.12), 0 2px 8px rgba(44,29,19,0.04)',
                    border: '1px solid #E6DBD1',
                    padding: '10px',
                    zIndex: 50,
                  }}
                  className="animate-in fade-in duration-150"
                >
                  {user ? (
                    // ─── LOGGED IN USER DROPDOWN ───
                    <div>
                      {/* User Profile Header */}
                      <div className="px-2 py-2 mb-2 flex items-center gap-3 border-b border-[#F0EBE5] pb-3">
                        <div className="w-10 h-10 rounded-full bg-[#2C1D13] text-[#FAF6F0] flex items-center justify-center font-serif text-sm font-semibold shrink-0 shadow-xs ring-2 ring-[#E2D5C7]">
                          {(user.user_metadata?.full_name || user.email || 'M').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-[#2C1D13] truncate leading-tight">
                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                          </p>
                          <p className="text-[11px] text-[#8C7B6B] truncate leading-tight mt-1">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* View Profile */}
                      <Link
                        href="/account"
                        onClick={() => setAccountMenuOpen(false)}
                        className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-[#2C1D13] hover:text-[#7B5B3A] hover:bg-[#FAF6F0] transition-all font-medium"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-[#FAF6F0] group-hover:bg-white flex items-center justify-center text-[#7B5B3A] transition-colors">
                            <IconUser size={14} />
                          </span>
                          <span>View Profile</span>
                        </div>
                        <IconChevronRight size={13} className="text-[#B8A89A] group-hover:text-[#7B5B3A] group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      {/* Track Order */}
                      <Link
                        href="/track-order"
                        onClick={() => setAccountMenuOpen(false)}
                        className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-[#2C1D13] hover:text-[#7B5B3A] hover:bg-[#FAF6F0] transition-all font-medium"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-[#FAF6F0] group-hover:bg-white flex items-center justify-center text-[#7B5B3A] transition-colors">
                            <IconTruck size={14} />
                          </span>
                          <span>Track Order</span>
                        </div>
                        <IconChevronRight size={13} className="text-[#B8A89A] group-hover:text-[#7B5B3A] group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      {/* Sign Out */}
                      <div className="border-t border-[#F0EBE5] mt-1.5 pt-1.5">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#8C3333] hover:bg-[#FAF4F0] transition-all font-medium cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // ─── GUEST (NOT LOGGED IN) DROPDOWN ───
                    <div>
                      {/* Sign In CTA Button */}
                      <div className="p-1 pb-3 mb-2 border-b border-[#F0EBE5]">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            setAuthModalMode('signin');
                            setIsAuthModalOpen(true);
                          }}
                          className="w-full py-2.5 px-4 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-xs flex items-center justify-center cursor-pointer active:scale-[0.99]"
                        >
                          Sign In
                        </button>
                        <p className="text-[11px] text-[#8C7B6B] text-center mt-2 mb-0">
                          Don&apos;t have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setAccountMenuOpen(false);
                              setAuthModalMode('signup');
                              setIsAuthModalOpen(true);
                            }}
                            className="text-[#7B5B3A] font-semibold hover:underline cursor-pointer"
                          >
                            Sign Up
                          </button>
                        </p>
                      </div>

                      {/* Track Order Button */}
                      <Link
                        href="/track-order"
                        onClick={() => setAccountMenuOpen(false)}
                        className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-[#2C1D13] hover:text-[#7B5B3A] hover:bg-[#FAF6F0] transition-all font-medium cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-[#FAF6F0] group-hover:bg-white flex items-center justify-center text-[#7B5B3A] transition-colors">
                            <IconTruck size={14} />
                          </span>
                          <span>Track Order</span>
                        </div>
                        <IconChevronRight size={13} className="text-[#B8A89A] group-hover:text-[#7B5B3A] group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      {/* View Profile Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          setAuthModalMode('signin');
                          setIsAuthModalOpen(true);
                        }}
                        className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-[#2C1D13] hover:text-[#7B5B3A] hover:bg-[#FAF6F0] transition-all font-medium cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-[#FAF6F0] group-hover:bg-white flex items-center justify-center text-[#7B5B3A] transition-colors">
                            <IconUser size={14} />
                          </span>
                          <span>View Profile</span>
                        </div>
                        <IconChevronRight size={13} className="text-[#B8A89A] group-hover:text-[#7B5B3A] group-hover:translate-x-0.5 transition-all" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={openWishlist}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F3ECE2] transition-colors text-[#2C1D13] [&>svg]:w-5 [&>svg]:h-5 cursor-pointer"
              aria-label={`My Wishlist (${wishlistCount} items)`}
              title="My Wishlist"
            >
              <IconHeart filled={wishlistCount > 0} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#8B4E5A] text-white text-[10px] font-bold flex items-center justify-center shadow-xs leading-none">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={openCart}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F3ECE2] transition-colors text-[#2C1D13] [&>svg]:w-5 [&>svg]:h-5 cursor-pointer"
              aria-label={`My Shopping Bag (${liveCartCount} items)`}
              title="Shopping Bag"
            >
              <IconShoppingBag />
              {liveCartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#2C1D13] text-white text-[10px] font-bold flex items-center justify-center shadow-xs leading-none">
                  {liveCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-[#3D2B1F]/50 z-[200] transition-all duration-300 ${isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 w-[min(320px,85vw)] h-[100dvh] bg-[#FAF6F0] z-[201] transition-transform duration-500 overflow-y-auto ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2D5C7]">
          <Link href="/" className="shrink-0" onClick={closeDrawer} aria-label="ZARISH - Home">
            <span className="relative inline-flex items-start">
              <Image
                src="/logo-zarish.png"
                alt="ZARISH by Nehala Mufeed"
                width={160}
                height={40}
                className="h-8 sm:h-9 w-auto object-contain"
              />
              <span className="text-[7px] sm:text-[8px] font-sans font-medium text-[#7B5B3A] select-none -translate-y-0.5 ml-0.5" aria-hidden="true">
                ™
              </span>
            </span>
          </Link>
          <button className="w-8 h-8 flex items-center justify-center text-[#2C1D13] [&>svg]:w-5 [&>svg]:h-5" onClick={closeDrawer} aria-label="Close navigation menu">
            <IconX />
          </button>
        </div>

        <nav className="py-4" aria-label="Mobile navigation">

          {activeNavItems.map((item) => {
              const isActive = item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center justify-between px-6 py-3 text-base transition-colors ${
                    isActive
                      ? 'text-[#7B5B3A] font-semibold bg-[#FAF4EE] border-l-2 border-[#7B5B3A]'
                      : 'text-[#2C1D13] hover:bg-[#F3ECE2]'
                  }`}
                  onClick={closeDrawer}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                  <IconChevronRight size={14} />
                </Link>
              );
            })}

          <div className="h-[1px] bg-[#E2D5C7] my-4 mx-6" />

          <div className="px-6 py-2 text-xs font-medium tracking-widest uppercase text-[#8C7B6B]">
            {user ? `Account (${user.email?.split('@')[0]})` : 'Customer Account'}
          </div>

          {user ? (
            <>
              <Link href="/account" className="flex items-center justify-between px-6 py-3 text-base text-[#2C1D13] hover:bg-[#F3ECE2] transition-colors" onClick={closeDrawer}>
                My Account & Orders
                <IconChevronRight size={14} />
              </Link>
              <Link href="/track-order" className="flex items-center justify-between px-6 py-3 text-base text-[#2C1D13] hover:bg-[#F3ECE2] transition-colors" onClick={closeDrawer}>
                Track Order
                <IconChevronRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  handleSignOut();
                }}
                className="flex items-center justify-between w-full px-6 py-3 text-base text-[#8C3333] hover:bg-[#FAF4F0] transition-colors cursor-pointer text-left"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="flex items-center justify-between w-full px-6 py-3 text-base text-[#2C1D13] hover:bg-[#F3ECE2] transition-colors cursor-pointer text-left"
                onClick={() => {
                  closeDrawer();
                  setAuthModalMode('signin');
                  setIsAuthModalOpen(true);
                }}
              >
                Sign In
                <IconChevronRight size={14} />
              </button>
              <button
                type="button"
                className="flex items-center justify-between w-full px-6 py-3 text-base font-semibold text-[#7B5B3A] hover:bg-[#F3ECE2] transition-colors cursor-pointer text-left"
                onClick={() => {
                  closeDrawer();
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
              >
                Create Account
                <IconChevronRight size={14} />
              </button>
              <Link
                href="/track-order"
                className="flex items-center justify-between w-full px-6 py-3 text-base text-[#2C1D13] hover:bg-[#F3ECE2] transition-colors cursor-pointer text-left"
                onClick={closeDrawer}
              >
                Track Order
                <IconChevronRight size={14} />
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Authentication Popup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Live Search Popup Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}
