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

export default function ShopBySize({
  sizes = [],
  sectionTitle = "WHAT'S YOUR SIZE?",
  sectionSubtitle = 'Find the perfect fit for you.',
  ctaText = 'EXPLORE STYLES IN MY SIZE',
}: ShopBySizeProps) {
  // Use only active sizes from database
  const displaySizes = useMemo(() => {
    if (!sizes || sizes.length === 0) return [];
    return sizes
      .filter((s) => s.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }, [sizes]);

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    return displaySizes[0]?.slug || '';
  });

  if (displaySizes.length === 0) {
    return null;
  }

  const activeSelected = selectedSize || displaySizes[0]?.slug || '';
  const ctaHref = activeSelected ? `/shop-by-size/${activeSelected.toLowerCase()}` : '/products';

  return (
    <section
      className="w-full py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8 bg-white"
      aria-labelledby="size-heading"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* ─── Outer Banner Card with Full Background Image ───────────────── */}
        <div className="relative overflow-hidden rounded-[22px] sm:rounded-[28px] md:rounded-[32px] bg-[#FAF7F2] border border-[#EDE4DC] flex flex-col md:flex-row items-stretch min-h-[220px] md:min-h-[230px]">
          
          {/* ─── Full Background Image ─── */}
          <div
            className="absolute inset-0 pointer-events-none select-none overflow-hidden"
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/size-banner-decor.jpg"
              alt="Tailor measuring tape and fabrics background"
              className="w-full h-full object-cover object-center md:object-right"
              loading="lazy"
            />
            {/* Subtle luminous tint overlay so buttons & shapes stand out crisply */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
          </div>

          {/* ─── 1. LEFT: Dark Brown Curved Shape ─────────────────── */}
          <div className="relative z-10 bg-[#613B24] text-white rounded-b-[32px] md:rounded-b-none md:rounded-r-[160px] lg:rounded-r-[190px] px-6 sm:px-8 lg:px-10 py-6 md:py-8 flex flex-col justify-center shrink-0 w-full md:w-[280px] lg:w-[320px] xl:w-[340px] text-center md:text-center shadow-md">
            <h2
              id="size-heading"
              className="font-display text-lg sm:text-xl lg:text-[24px] font-bold tracking-normal uppercase leading-[1.12] text-white"
            >
              WHAT&apos;S<br />YOUR SIZE?
            </h2>

            <p className="text-[11px] sm:text-xs text-[#EAE0D7] font-normal mt-1.5 leading-relaxed">
              {sectionSubtitle}
            </p>
          </div>

          {/* ─── 2. CENTER: Size Pills & Explore Button ────────────── */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3.5 sm:gap-4 px-4 py-8 md:py-7 md:pr-10 lg:pr-16">
            
            {/* Size Buttons Row */}
            <div
              className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap"
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
                    className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200 select-none cursor-pointer ${
                      isSelected
                        ? 'bg-[#613B24] text-white shadow-[0_4px_14px_rgba(97,59,36,0.35)] scale-105 border border-[#613B24]'
                        : 'bg-white text-[#2C1D13] shadow-[0_2px_10px_rgba(44,29,19,0.06)] border border-[#EAE2DA] hover:border-[#613B24]/40 hover:-translate-y-0.5 active:scale-95'
                    }`}
                  >
                    {size.name}
                  </button>
                );
              })}
            </div>

            {/* Pill Action Button */}
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center gap-1.5 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-[#613B24] hover:bg-[#4E2F1C] text-white text-[11px] sm:text-xs font-bold tracking-[0.12em] uppercase transition-all duration-300 shadow-[0_3px_14px_rgba(97,59,36,0.25)] hover:shadow-[0_5px_18px_rgba(97,59,36,0.35)] active:scale-[0.98] group cursor-pointer"
            >
              <span>{ctaText}</span>
              <span
                className="text-xs transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
}
