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
    <article className="product-card">
      <Link href={`/products/${product.slug}`} aria-label={product.name}>
        <div className="product-card__image-wrapper">
          {primaryImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={optimizeCloudinaryUrl(primaryImage.secure_url, { width: 600 })}
              alt={primaryImage.alt_text || product.name}
              loading="lazy"
              width={primaryImage.width}
              height={primaryImage.height}
            />
          ) : (
            <div className="product-card__image-placeholder" aria-hidden="true" />
          )}

          {/* Badges */}
          <div className="product-card__badge">
            {product.is_new_arrival && <Badge variant="new" />}
            {product.is_on_sale && !product.is_new_arrival && <Badge variant="sale" />}
            {product.stock_quantity <= 0 && <Badge variant="out-of-stock" />}
          </div>

          {/* Wishlist */}
          <div className="product-card__wishlist">
            <WishlistButton productId={product.id} />
          </div>
        </div>

        <div className="product-card__info">
          <h3 className="product-card__name">{product.name}</h3>
          <div className="product-card__price-row">
            <span className="product-card__price">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="product-card__compare-price">
                  {formatPrice(product.compare_at_price!)}
                </span>
                <span className="product-card__discount">
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
