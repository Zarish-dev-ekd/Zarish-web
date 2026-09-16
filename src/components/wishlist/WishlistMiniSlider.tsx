'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { formatPrice, optimizeCloudinaryUrl } from '@/lib/utils';
import { useWishlist, type WishlistProduct } from '@/context/WishlistContext';
import { IconHeart } from '@/components/icons';

interface WishlistMiniSliderProps {
  onItemClick?: () => void;
}

export default function WishlistMiniSlider({ onItemClick }: WishlistMiniSliderProps) {
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    async function loadProducts() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            compare_at_price,
            images:product_images(secure_url, role)
          `)
          .eq('is_active', true)
          .limit(8);

        if (!error && data && data.length > 0) {
          const mapped: WishlistProduct[] = data.map((p: any) => {
            const primaryImg =
              p.images?.find((img: any) => img.role === 'primary')?.secure_url ||
              p.images?.[0]?.secure_url ||
              null;
            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.price,
              compare_at_price: p.compare_at_price,
              image_url: primaryImg,
            };
          });
          setProducts(mapped);
        }
      } catch {
        // Silently catch fetch errors
      }
    }

    loadProducts();
  }, []);

  if (products.length === 0) {
    return null;
  }

  // Ensure enough items to smoothly loop infinitely across all drawer widths
  const loopProducts =
    products.length <= 4
      ? [...products, ...products, ...products, ...products]
      : [...products, ...products];

  return (
    <div className="pt-3 pb-2 border-t border-[#E2D5C7]/80 bg-[#FAF6F0] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B4E5A] animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#7B5B3A]">
            You May Also Like
          </span>
        </div>  
      </div>

      {/* Auto-Slide Infinity Loop Track */}
      <div className="relative overflow-hidden w-full group">
        {/* Soft edge fade masks for high-end luxury aesthetic */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#FAF6F0] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#FAF6F0] to-transparent z-10" />

        {/* Marquee Row */}
        <div className="flex gap-2.5 w-max animate-marquee group-hover:[animation-play-state:paused] px-4 py-1">
          {loopProducts.map((item, idx) => {
            const isWish = isInWishlist(item.id);

            return (
              <div
                key={`${item.id}-${idx}`}
                className="w-[124px] shrink-0 group/card bg-white rounded-xl p-1.5 border border-[#E2D5C7]/70 hover:border-[#7B5B3A] shadow-2xs hover:shadow-xs transition-all duration-200"
              >
                {/* Image & Quick Wishlist Toggle */}
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#F3ECE2]">
                  <Link href={`/products/${item.slug}`} onClick={onItemClick} className="block w-full h-full">
                    {item.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={optimizeCloudinaryUrl(item.image_url, { width: 260 })}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#F5EDE4] to-[#EAE0D5]" />
                    )}
                  </Link>

                  {/* Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(item);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer"
                    aria-label={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <span className={isWish ? 'text-[#C62828] fill-[#C62828]' : 'text-[#8C7B6B] hover:text-[#2C1D13]'}>
                      <IconHeart filled={isWish} size={12} />
                    </span>
                  </button>
                </div>

                {/* Info */}
                <div className="pt-1.5 px-0.5">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={onItemClick}
                    className="block font-display text-[11px] font-semibold text-[#2C1D13] hover:text-[#7B5B3A] truncate leading-tight transition-colors"
                    title={item.name}
                  >
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-bold text-[#7B5B3A]">
                      {formatPrice(item.price)}
                    </span>
                    {item.compare_at_price && item.compare_at_price > item.price && (
                      <span className="text-[9px] text-[#8C7B6B] line-through">
                        {formatPrice(item.compare_at_price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
