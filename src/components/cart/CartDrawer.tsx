'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { IconShoppingBag, IconX, IconArrowRight } from '@/components/icons';
import { formatPrice, optimizeCloudinaryUrl } from '@/lib/utils';

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, updateQuantity, removeFromCart, clearCart, count, subtotal } = useCart();

  // Close drawer on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    },
    [isCartOpen, closeCart]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  return (
    <>
      {/* Dimmed backdrop */}
      <div
        className={`fixed inset-0 bg-[#3D2B1F]/50 backdrop-blur-xs z-[299] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-over Drawer coming from the RIGHT */}
      <aside
        className={`fixed top-0 bottom-0 right-0 w-[min(440px,92vw)] h-full bg-[#FAF6F0] z-[300] transition-transform duration-300 ease-out flex flex-col ${isCartOpen
            ? 'translate-x-0 shadow-[-16px_0_50px_rgba(44,29,19,0.18)]'
            : 'translate-x-full shadow-none invisible pointer-events-none'
          }`}
        role="dialog"
        aria-label="Shopping Bag"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2D5C7] bg-[#FAF6F0] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#F3ECE2] text-[#7B5B3A] flex items-center justify-center">
              <IconShoppingBag size={16} />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-[#2C1D13] tracking-wide uppercase leading-none">
                Shopping Bag
              </h2>
              <p className="text-[11px] text-[#8C7B6B] mt-0.5">
                {count === 1 ? '1 item' : `${count} items`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#2C1D13] hover:bg-[#F3ECE2] transition-colors cursor-pointer"
            aria-label="Close Shopping Bag"
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
                  onClick={closeCart}
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
                    onClick={closeCart}
                    className="block font-display text-xs sm:text-sm font-semibold text-[#2C1D13] hover:text-[#7B5B3A] transition-colors line-clamp-2 leading-snug"
                  >
                    {item.name}
                  </Link>

                  {/* Color & Size pills */}
                  {(item.color || item.size) && (
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      {item.color && (
                        <span className="inline-block text-[10px] font-bold text-[#2C1D13] bg-[#EAE0D5] px-2 py-0.5 rounded capitalize tracking-wider">
                          Color: {item.color}
                        </span>
                      )}
                      {item.size && (
                        <span className="inline-block text-[10px] font-bold text-[#7B5B3A] bg-[#F3ECE2] px-2 py-0.5 rounded uppercase tracking-wider">
                          Size: {item.size}
                        </span>
                      )}
                    </div>
                  )}

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

                  {/* Quantity and Remove */}
                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity controls */}
                    <div className="inline-flex items-center border border-[#E2D5C7] rounded-full bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-xs text-[#3D2B1F] hover:bg-[#FAF6F0] active:scale-90 transition-all cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-[#2C1D13]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-xs text-[#3D2B1F] hover:bg-[#FAF6F0] active:scale-90 transition-all cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-[11px] text-[#8C3333] hover:underline cursor-pointer transition-colors"
                      aria-label={`Remove ${item.name} from bag`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 my-auto">
              <div className="w-16 h-16 rounded-full bg-[#F3ECE2] flex items-center justify-center text-[#7B5B3A] mb-3">
                <IconShoppingBag size={28} />
              </div>
              <h3 className="font-display text-lg font-bold text-[#2C1D13] mb-1">
                Your Bag is Empty
              </h3>
              <p className="text-xs text-[#8C7B6B] leading-relaxed max-w-[260px] mb-5">
                Explore our curated collection of modest elegance and add your favorite garments.
              </p>
              <Link
                href="/products"
                onClick={closeCart}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-xs"
              >
                <IconShoppingBag size={14} />
                <span>Explore Collections</span>
              </Link>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {count > 0 && (
          <div className="p-4 border-t border-[#E2D5C7] bg-[#FAF6F0] shrink-0 space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#6B5744] font-medium">
                Subtotal
              </span>
              <span className="font-display text-base font-bold text-[#2C1D13]">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="text-[11px] text-[#8C7B6B]">
              Taxes included. Complimentary shipping on orders over ₹2,999.
            </p>

            <div className="flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md text-center cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <IconArrowRight size={14} />
              </Link>
            </div>

            <button
              type="button"
              onClick={clearCart}
              className="w-full text-center text-xs text-[#8C7B6B] hover:text-[#8C3333] transition-colors py-1 cursor-pointer"
            >
              Clear Shopping Bag
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
