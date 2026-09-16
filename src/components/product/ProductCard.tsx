import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatPrice, getDiscountPercent, optimizeCloudinaryUrl } from '@/lib/utils';
import WishlistButton from './WishlistButton';
import Badge from './Badge';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.role === 'primary') || product.images?.[0];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? getDiscountPercent(product.price, product.compare_at_price!)
    : 0;

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

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            {product.is_new_arrival && <Badge variant="new" />}
            {product.is_on_sale && !product.is_new_arrival && <Badge variant="sale" />}
            {product.stock_quantity <= 0 && <Badge variant="out-of-stock" />}
          </div>

          {/* Wishlist */}
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton product={product} />
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="font-display text-[13px] font-semibold tracking-[0.03em] text-[#2C1D13] mb-2 leading-snug line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-semibold text-[#2C1D13]">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-xs sm:text-sm text-[#8C7B6B] line-through">
                  {formatPrice(product.compare_at_price!)}
                </span>
                <span className="text-xs text-[#0E7064] font-medium">
                  ({discountPercent}% off)
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
