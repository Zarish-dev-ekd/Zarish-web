'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Size } from '@/lib/types';

interface ShopBySizeProps {
  sizes?: Size[];
  sectionTitle?: string;
  sectionSubtitle?: string;
  ctaText?: string;
  decorativeText?: string;
}

// Default standard sizes matching reference banner
const FALLBACK_SIZES: { id: string; name: string; slug: string }[] = [
  { id: 's', name: 'S', slug: 's' },
  { id: 'm', name: 'M', slug: 'm' },
  { id: 'l', name: 'L', slug: 'l' },
  { id: 'xl', name: 'XL', slug: 'xl' },
  { id: 'xxl', name: 'XXL', slug: 'xxl' },
  { id: 'xxxl', name: 'XXXL', slug: 'xxxl' },
];

export default function ShopBySize({
  sizes = [],
  sectionTitle = "WHAT'S YOUR SIZE?",
  sectionSubtitle = 'Find the perfect fit for you.',
  ctaText = 'EXPLORE STYLES IN MY SIZE',
  decorativeText = 'Every Size Beautiful',
}: ShopBySizeProps) {
  // Use active sizes from database or fallback if none configured
  const displaySizes = useMemo(() => {
    if (sizes && sizes.length > 0) {
      const active = sizes
        .filter((s) => s.is_active)
        .sort((a, b) => a.display_order - b.display_order);
      if (active.length > 0) return active;
    }
    return FALLBACK_SIZES;
  }, [sizes]);

  // Default selected size to 'l' (or first available) matching reference visual
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const hasL = displaySizes.some((s) => s.slug.toLowerCase() === 'l');
    return hasL ? 'l' : displaySizes[0]?.slug || 'l';
  });

  const ctaHref = selectedSize ? `/shop-by-size/${selectedSize.toLowerCase()}` : '/products';

  return (
    <section
      className="w-full py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-[#FAF6F0]"
      aria-labelledby="size-heading"
    >
      <div className="max-w-6xl mx-auto">
        {/* ─── Cute Rounded Luxury Banner Container ───────────────── */}
        <div className="relative overflow-hidden rounded-[26px] sm:rounded-[34px] lg:rounded-[40px] bg-gradient-to-r from-[#FBF2EC] via-[#F7EBE1] to-[#F9EFE7] border border-[#EBDCD0] shadow-[0_8px_30px_rgba(123,91,58,0.06)] px-6 py-8 sm:px-10 sm:py-10 md:py-12 lg:px-12 xl:px-14">
          
          {/* Subtle Warm Inner Ambient Glow */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gradient-to-bl from-[#C4917B]/15 to-transparent blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-6">
            
            {/* ─── LEFT: Heading & Subtitle ───────────────────────── */}
            <div className="flex flex-col text-center lg:text-left flex-shrink-0">
              <h2
                id="size-heading"
                className="font-display text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#2C1D13] leading-[1.08] tracking-tight uppercase"
              >
                WHAT&apos;S<br />YOUR SIZE?
              </h2>
              <p className="text-xs sm:text-sm text-[#7B6858] font-medium mt-2">
                {sectionSubtitle}
              </p>
            </div>

            {/* ─── CENTER: Size Pills & Explore Button ────────────── */}
            <div className="flex flex-col items-center gap-4 sm:gap-5 w-full lg:w-auto">
              {/* Size Buttons Row */}
              <div
                className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap"
                role="radiogroup"
                aria-label="Select your size"
              >
                {displaySizes.map((size) => {
                  const isSelected = selectedSize.toLowerCase() === size.slug.toLowerCase();
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size.slug.toLowerCase())}
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Size ${size.name}`}
                      className={`w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full sm:rounded-2xl flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-200 select-none cursor-pointer ${
                        isSelected
                          ? 'bg-[#884A48] text-white shadow-[0_4px_16px_rgba(136,74,72,0.38)] scale-105 sm:scale-110 border border-[#884A48]'
                          : 'bg-white text-[#2C1D13] shadow-[0_2px_8px_rgba(44,29,19,0.06)] border border-[#EFE5DC] hover:border-[#884A48]/50 hover:shadow-md hover:-translate-y-0.5 active:scale-95'
                      }`}
                    >
                      {size.name}
                    </button>
                  );
                })}
              </div>

              {/* Pill Action Button with forward arrow */}
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3 sm:py-3.5 rounded-full bg-[#884A48] hover:bg-[#743C3A] text-white text-xs sm:text-[13px] font-semibold tracking-[0.14em] uppercase transition-all duration-300 shadow-[0_4px_18px_rgba(136,74,72,0.3)] hover:shadow-[0_6px_24px_rgba(136,74,72,0.42)] active:scale-[0.98] group w-full sm:w-auto"
              >
                <span>{ctaText}</span>
                <span
                  className="text-sm transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            </div>

            {/* ─── RIGHT: Calligraphy Script & Botanical Branch ────── */}
            <div className="flex items-center justify-center lg:justify-end gap-3 sm:gap-4 select-none relative flex-shrink-0">
              {/* Cute Handwritten Calligraphy Script */}
              <div className="flex flex-col text-center lg:text-left">
                <span className="font-script text-3xl sm:text-4xl lg:text-[42px] text-[#2C1D13] leading-[1.0] -rotate-6 transform origin-bottom-left tracking-wide inline-block drop-shadow-sm">
                  Every<br />Size<br />Beautiful{' '}
                  <span className="font-sans text-xl sm:text-2xl text-[#884A48] inline-block -rotate-3">
                    ♡
                  </span>
                </span>
              </div>

              {/* Hand-drawn Botanical Branch Line Art */}
              <div className="flex-shrink-0 pointer-events-none" aria-hidden="true">
                <svg
                  viewBox="0 0 110 170"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-16 sm:w-20 md:w-24 lg:w-28 h-auto text-[#884A48] opacity-75 sm:opacity-90"
                >
                  {/* Graceful central stem */}
                  <path
                    d="M68 170 C64 125, 56 80, 54 12"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  {/* Top delicate bud */}
                  <path
                    d="M54 12 C50 4, 58 4, 54 12 Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    fill="currentColor"
                    fillOpacity="0.1"
                  />
                  {/* Leaf 1 - Right Top */}
                  <path
                    d="M55 32 C68 26, 78 34, 71 43 C64 47, 56 39, 55 32 Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    fill="currentColor"
                    fillOpacity="0.08"
                  />
                  <path
                    d="M55 32 C62 35, 67 38, 71 43"
                    stroke="currentColor"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                  {/* Leaf 2 - Left Upper */}
                  <path
                    d="M55 52 C39 44, 30 54, 37 63 C45 67, 53 59, 55 52 Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    fill="currentColor"
                    fillOpacity="0.08"
                  />
                  <path
                    d="M55 52 C47 55, 42 58, 37 63"
                    stroke="currentColor"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                  {/* Leaf 3 - Right Mid */}
                  <path
                    d="M56 76 C74 68, 85 78, 77 89 C68 95, 58 85, 56 76 Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    fill="currentColor"
                    fillOpacity="0.08"
                  />
                  <path
                    d="M56 76 C65 80, 71 84, 77 89"
                    stroke="currentColor"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                  {/* Leaf 4 - Left Lower */}
                  <path
                    d="M58 104 C38 94, 26 106, 35 118 C45 124, 55 114, 58 104 Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    fill="currentColor"
                    fillOpacity="0.08"
                  />
                  <path
                    d="M58 104 C49 108, 41 112, 35 118"
                    stroke="currentColor"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                  {/* Leaf 5 - Right Lower */}
                  <path
                    d="M62 132 C83 122, 96 134, 88 147 C77 155, 65 143, 62 132 Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    fill="currentColor"
                    fillOpacity="0.08"
                  />
                  <path
                    d="M62 132 C72 136, 81 140, 88 147"
                    stroke="currentColor"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
