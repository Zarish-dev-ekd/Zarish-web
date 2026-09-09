'use client';

import { useState } from 'react';
import { IconHeart } from '@/components/icons';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
}

export default function WishlistButton({ productId }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Connect to Supabase wishlist
    setIsWishlisted(!isWishlisted);
  };

  return (
    <button
      className={cn('wishlist-btn', isWishlisted && 'wishlist-btn--active')}
      onClick={handleToggle}
      aria-label={isWishlisted ? `Remove from wishlist` : `Add to wishlist`}
      data-product-id={productId}
    >
      <IconHeart filled={isWishlisted} size={16} />
    </button>
  );
}
