'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
import { IconHeart, IconX, IconArrowRight, IconShoppingBag } from '@/components/icons';
import { formatPrice, optimizeCloudinaryUrl } from '@/lib/utils';
import WishlistMiniSlider from './WishlistMiniSlider';

export default function WishlistDrawer() {
  const { items, isWishlistOpen, closeWishlist, removeFromWishlist, clearWishlist, count } = useWishlist();

  // Close drawer on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWishlistOpen) {
        closeWishlist();
      }
    },
    [isWishlistOpen, closeWishlist]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isWishlistOpen]);

  return (
    <>
      {/* Dimmed backdrop */}
      <div
        className={`fixed inset-0 bg-[#3D2B1F]/50 backdrop-blur-xs z-[299] transition-opacity duration-300 ${
          isWishlistOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={closeWishlist}
        aria-hidden="true"
      />

      {/* Slide-over Drawer coming from the RIGHT */}
      <aside
        className={`fixed top-0 bottom-0 right-0 w-[min(420px,90vw)] h-full bg-[#FAF6F0] z-[300] transition-transform duration-300 ease-out flex flex-col ${
          isWishlistOpen
            ? 'translate-x-0 shadow-[-16px_0_50px_rgba(44,29,19,0.18)]'
            : 'translate-x-full shadow-none invisible pointer-events-none'
        }`}
        role="dialog"
        aria-label="Wishlist"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2D5C7] bg-[#FAF6F0] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#F3ECE2] text-[#8B4E5A] flex items-center justify-center">
              <IconHeart filled size={16} />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-[#2C1D13] tracking-wide uppercase leading-none">
                My Wishlist
              </h2>
              <p className="text-[11px] text-[#8C7B6B] mt-0.5">
                {count === 1 ? '1 item saved' : `${count} items saved`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeWishlist}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#2C1D13] hover:bg-[#F3ECE2] transition-colors cursor-pointer"
            aria-label="Close Wishlist"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#F0EBE5]">
          {count > 0 ? (
            items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5 items-center group">
                {/* Thumbnail */}
                <Link
                  href={`/products/${item.slug}`}
                  onClick={closeWishlist}
                  className="relative w-20 h-24 rounded-xl overflow-hidden bg-[#F3ECE2] shrink-0 border border-[#E2D5C7]/70"
                >
                  {item.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={optimizeCloudinaryUrl(item.image_url, { width: 200 })}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#F5EDE4] to-[#EAE0D5]" />
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeWishlist}
                    className="block font-display text-xs sm:text-sm font-semibold text-[#2C1D13] hover:text-[#7B5B3A] transition-colors line-clamp-2 leading-snug"
                  >
                    {item.name}
                  </Link>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-[#2C1D13]">
                      {formatPrice(item.price)}
                    </span>
                    {item.compare_at_price && item.compare_at_price > item.price && (
                      <span className="text-[11px] text-[#8C7B6B] line-through">
                        {formatPrice(item.compare_at_price)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeWishlist}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7B5B3A] hover:text-[#2C1D13] uppercase tracking-wider transition-colors"
                    >
                      <span>View Piece</span>
                      <IconArrowRight size={11} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-[11px] text-[#8C3333] hover:underline cursor-pointer transition-colors ml-auto"
                      aria-label={`Remove ${item.name} from wishlist`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 my-auto">
              <div className="w-16 h-16 rounded-full bg-[#F3ECE2] flex items-center justify-center text-[#8B4E5A] mb-3">
                <IconHeart size={28} />
              </div>
              <h3 className="font-display text-lg font-bold text-[#2C1D13] mb-1">
                Your Wishlist is Empty
              </h3>
              <p className="text-xs text-[#8C7B6B] leading-relaxed max-w-[260px] mb-5">
                Tap the heart icon on any garment you love to save it here for later.
              </p>
              <Link
                href="/products"
                onClick={closeWishlist}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-xs"
              >
                <IconShoppingBag size={14} />
                <span>Explore Collections</span>
              </Link>
            </div>
          )}
        </div>

        {/* Recommended Garments Infinite Auto-Slider at Bottom */}
        <div className="shrink-0">
          <WishlistMiniSlider onItemClick={closeWishlist} />
        </div>

        {/* Drawer Footer */}
        {count > 0 && (
          <div className="p-4 border-t border-[#E2D5C7] bg-[#FAF6F0] shrink-0 space-y-2.5">
            <Link
              href="/products"
              onClick={closeWishlist}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-xs text-center cursor-pointer"
            >
              <span>Explore More Pieces</span>
              <IconArrowRight size={14} />
            </Link>

            <button
              type="button"
              onClick={clearWishlist}
              className="w-full text-center text-xs text-[#8C7B6B] hover:text-[#8C3333] transition-colors py-1 cursor-pointer"
            >
              Clear Entire Wishlist
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
