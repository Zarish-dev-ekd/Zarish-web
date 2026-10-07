'use client';

import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatPrice, optimizeCloudinaryUrl } from '@/lib/utils';
import WishlistButton from './WishlistButton';
import Badge from './Badge';
import { getProductBadge } from '@/lib/badges';
import { useStockBadgeConfig } from '@/lib/stock-badge-settings';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.role === 'primary') || product.images?.[0];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const customBadge = getProductBadge(product);
  const config = useStockBadgeConfig();

  const totalStock =
    product.variants && product.variants.length > 0
      ? product.variants.reduce((sum, v) => sum + (v.stock_quantity ?? 0), 0)
      : (product.stock_quantity ?? 0);
  const isOutOfStock = totalStock <= 0;
  const isLowStock = !isOutOfStock && config.enable_low_stock_badge && totalStock <= (config.low_stock_threshold || 3);
  const isShowInStock = !isOutOfStock && !isLowStock && config.show_in_stock_badge;

  return (
    <article className="group relative rounded-xl overflow-hidden transition-all duration-300 bg-white hover:-translate-y-1 hover:shadow-lg cursor-pointer border border-[#F0EBE5]">
      <Link href={`/products/${product.slug}`} aria-label={product.name} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-white">
          {primaryImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={optimizeCloudinaryUrl(primaryImage.secure_url, { width: 600 })}
              alt={primaryImage.alt_text || product.name}
              loading="lazy"
              width={primaryImage.width}
              height={primaryImage.height}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#F5EDE4] to-[#EAE0D5] flex items-center justify-center" aria-hidden="true" />
          )}

          {/* Top-Left: Custom Ribbon OR Fallback New Arrival Badge */}
          {customBadge ? (
            <Badge badge={customBadge} />
          ) : (
            product.is_new_arrival && (
              <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 pointer-events-none">
                <Badge variant="new" />
              </div>
            )
          )}


          {/* Top-Right: Wishlist Button */}
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10">
            <WishlistButton product={product} />
          </div>

          {/* Bottom-Right: Stock / Sold Out Badge */}
          <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
            {isOutOfStock ? (
              <Badge variant="out-of-stock" />
            ) : isLowStock ? (
              <span className="inline-flex items-center px-1.5 py-1 rounded text-[9px] font-semibold tracking-wide uppercase leading-none bg-[#C0392B]/95 text-white shadow-xs">
                Only {totalStock} left
              </span>
            ) : isShowInStock ? (
              <span className="inline-flex items-center px-1.5 py-1 rounded text-[9px] font-semibold tracking-wide uppercase leading-none bg-[#0E7064]/95 text-white shadow-xs">
                In Stock
              </span>
            ) : null}
          </div>
        </div>


        <div className="p-3 sm:p-4">
          <h3 className="font-display text-[13px] font-semibold tracking-[0.03em] text-[#2C1D13] mb-2 leading-snug line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-semibold text-[#2C1D13]">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-[#8C7B6B] line-through">
                {formatPrice(product.compare_at_price!)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
