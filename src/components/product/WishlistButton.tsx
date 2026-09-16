'use client';

import { useWishlist, type WishlistProduct } from '@/context/WishlistContext';
import type { Product } from '@/lib/types';
import { IconHeart } from '@/components/icons';

interface WishlistButtonProps {
  productId?: string;
  product?: Product | WishlistProduct;
  className?: string;
  size?: number;
}

export default function WishlistButton({
  productId,
  product,
  className = '',
  size = 16,
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();

  const targetId = product?.id || productId || '';
  const isWishlisted = isInWishlist(targetId);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!targetId) return;

    // Extract product details
    const primaryImg =
      (product as Product)?.images?.find((img) => img.role === 'primary')?.secure_url ||
      (product as Product)?.images?.[0]?.secure_url ||
      (product as WishlistProduct)?.image_url ||
      null;

    const wishlistItem: WishlistProduct = {
      id: targetId,
      name: product?.name || 'Garment',
      slug: product?.slug || '',
      price: product?.price || 0,
      compare_at_price: product?.compare_at_price,
      image_url: primaryImg,
    };

    toggleWishlist(wishlistItem);
  };

  return (
    <button
      type="button"
      className={
        className ||
        'w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-xs border-none'
      }
      onClick={handleToggle}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      data-product-id={targetId}
    >
      <span
        className={`transition-colors duration-200 ${
          isWishlisted ? 'text-[#C62828] fill-[#C62828]' : 'text-[#8C7B6B] hover:text-[#2C1D13]'
        }`}
      >
        <IconHeart filled={isWishlisted} size={size} />
      </span>
    </button>
  );
}
