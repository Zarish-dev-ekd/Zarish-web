'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Size } from '@/lib/types';
import { IconArrowRight } from '@/components/icons';
import { cn } from '@/lib/utils';

interface ShopBySizeProps {
  sizes: Size[];
  sectionTitle: string;
  sectionSubtitle: string;
  ctaText: string;
  decorativeText: string;
}

export default function ShopBySize({
  sizes,
  sectionTitle,
  sectionSubtitle,
  ctaText,
  decorativeText,
}: ShopBySizeProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const activeSizes = sizes
    .filter((s) => s.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  const ctaHref = selectedSize ? `/shop-by-size/${selectedSize}` : '/products';

  return (
    <section className="shop-by-size section" aria-labelledby="size-heading">
      <div className="shop-by-size__inner">
        <div className="shop-by-size__content">
          <h2 id="size-heading">{sectionTitle || "WHAT'S YOUR SIZE?"}</h2>
          <p>{sectionSubtitle || 'Find the perfect fit for you.'}</p>
        </div>

        <div className="shop-by-size__pills-area">
          {activeSizes.length > 0 ? (
            <div className="shop-by-size__pills" role="radiogroup" aria-label="Select your size">
              {activeSizes.map((size) => (
                <button
                  key={size.id}
                  className={cn(
                    'size-pill',
                    selectedSize === size.slug && 'size-pill--selected'
                  )}
                  onClick={() => setSelectedSize(size.slug === selectedSize ? null : size.slug)}
                  role="radio"
                  aria-checked={selectedSize === size.slug}
                  aria-label={`Size ${size.name}`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-state__message">Sizes will appear here once configured.</p>
            </div>
          )}

          <Link href={ctaHref} className="btn btn--accent btn--lg">
            {ctaText || 'EXPLORE STYLES IN MY SIZE'}
            <IconArrowRight size={16} />
          </Link>

          {decorativeText && (
            <span className="shop-by-size__decorative" aria-hidden="true">
              {decorativeText} ♡
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
