'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { HeroSlide } from '@/lib/types';
import { IconArrowRight } from '@/components/icons';
import { optimizeCloudinaryUrl } from '@/lib/utils';

interface HeroSectionProps {
  hero?: HeroSlide | null;
  slides?: HeroSlide[];
}

export default function HeroSection({ hero, slides }: HeroSectionProps) {
  // Combine slides or fallback to hero
  const allSlides: HeroSlide[] = (slides && slides.length > 0)
    ? slides
    : hero
    ? [hero]
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = allSlides.length;

  const goToNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play timer for multi-banners
  useEffect(() => {
    if (total <= 1) return;

    timerRef.current = setInterval(() => {
      goToNext();
    }, 3800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, goToNext]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    if (Math.abs(diffX) > 25 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (total === 0) {
    return (
      <section className="relative w-full bg-[#FAF6F0] h-[calc(100vh-108px)] sm:h-[calc(100vh-112px)] h-[calc(100dvh-108px)] sm:h-[calc(100dvh-112px)] min-h-[calc(100dvh-108px)] sm:min-h-[calc(100dvh-112px)] flex items-center justify-center">
        <p className="text-sm tracking-widest text-[#7B5B3A] uppercase">ZARISH BY NEHALA MUFEED</p>
      </section>
    );
  }

  const currentSlide = allSlides[currentIndex];

  return (
    <section
      className="relative w-full overflow-hidden bg-[#FAF6F0] h-[calc(100vh-108px)] sm:h-[calc(100vh-112px)] h-[calc(100dvh-108px)] sm:h-[calc(100dvh-112px)] min-h-[calc(100dvh-108px)] sm:min-h-[calc(100dvh-112px)] flex items-end md:items-center select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription={total > 1 ? 'carousel' : undefined}
      aria-label="Featured Collections"
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* BACKGROUND IMAGES (Mobile & Desktop with Smooth Transitions) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {allSlides.map((slide, idx) => {
        const isActive = idx === currentIndex;
        const desktopImg = slide.image_url;
        const mobileImg = slide.mobile_image_url || slide.image_url;

        return (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-0 pointer-events-auto' : 'opacity-0 z-[-1] pointer-events-none'
            }`}
            aria-hidden={!isActive}
          >
            {/* Mobile Full-Cover Banner Background (<= 768px) */}
            <div className="absolute inset-0 md:hidden overflow-hidden pointer-events-none" aria-hidden="true">
              {mobileImg ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={optimizeCloudinaryUrl(mobileImg, { width: 900 })}
                  alt={slide.image_alt || slide.title || 'ZARISH Modest Fashion'}
                  className={`w-full h-full object-cover object-[center_top] transition-transform duration-1000 ease-out ${
                    isActive ? 'scale-100' : 'scale-105'
                  }`}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#F0E4D8] to-[#FAF6F0]" />
              )}
              {/* Minimal, soft ivory gradient only at the very bottom on mobile — leaves model's face, body, and backdrop 100% crystal-clear */}
              <div className="absolute bottom-0 inset-x-0 h-[44%] bg-gradient-to-t from-[#FAF6F0] via-[#FAF6F0]/75 via-32% to-transparent pointer-events-none" />
            </div>

            {/* Desktop Full-Cover Banner Background (> 768px) */}
            <div className="absolute inset-0 hidden md:block overflow-hidden pointer-events-none" aria-hidden="true">
              {desktopImg ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={optimizeCloudinaryUrl(desktopImg, { width: 1920 })}
                  alt={slide.image_alt || slide.title || 'ZARISH Modest Fashion'}
                  className={`w-full h-full object-cover object-center object-top transition-transform duration-1000 ease-out ${
                    isActive ? 'scale-100' : 'scale-105'
                  }`}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#F0E4D8] to-[#FAF6F0]" />
              )}
              {/* Ultra-subtle text-readability gradient only on the far left margin — leaves 70%+ of the photo, model, and florals 100% crystal-clear */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FAF6F0]/80 via-[#FAF6F0]/35 via-24% via-transparent via-36% to-transparent pointer-events-none" />
            </div>
          </div>
        );
      })}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MOBILE HERO VIEW (<= 768px): Clean, Neat & Minimalist Luxury  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full md:hidden flex flex-col justify-end px-5 sm:px-8 pb-5 pt-12 h-full">
        {/* Eyebrow - Only if provided in DB */}
        {currentSlide?.eyebrow && (
          <div className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#7B5B3A] mb-1.5 flex items-center transition-all duration-500">
            <span>{currentSlide.eyebrow}</span>
            {currentSlide?.campaign_badge && (
              <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-[#8B4E5A] text-white">
                {currentSlide.campaign_badge}
              </span>
            )}
          </div>
        )}

        {/* Heading - Only if provided in DB */}
        {currentSlide?.title && (
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2C1D13] leading-[1.08] tracking-normal mb-2 transition-all duration-500 whitespace-pre-line">
            {currentSlide.title}
          </h1>
        )}

        {/* Subtitle - Only if provided in DB */}
        {currentSlide?.subtitle && (
          <p className="text-xs sm:text-sm text-[#3D2B1F] font-medium leading-relaxed mb-4 max-w-[340px] transition-all duration-500 drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]">
            {currentSlide.subtitle}
          </p>
        )}

        {/* CTA Button - Only if provided in DB */}
        {currentSlide?.cta_text && (
          <Link
            href={currentSlide.cta_url || '/products'}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#2C1D13] hover:bg-[#3D2B1F] text-white px-7 py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-[0_4px_16px_rgba(44,29,19,0.22)] w-full sm:w-auto mb-5"
          >
            <span>{currentSlide.cta_text}</span>
          
          </Link>
        )}

        {/* Mobile Slide Indicators (Only shown if 2+ banners are configured) */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {allSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-7 bg-[#2C1D13]'
                    : 'w-2 bg-[#2C1D13]/25 hover:bg-[#2C1D13]/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DESKTOP HERO VIEW (> 768px): Original Full Panorama Layout     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-14 py-8 md:py-16 h-full hidden md:flex flex-col justify-center">
        {/* Left Column Text */}
        <div className="w-full md:max-w-md lg:max-w-lg flex flex-col justify-center">
          {/* Eyebrow - Only if provided in DB */}
          {currentSlide?.eyebrow && (
            <div className="text-[11px] md:text-xs font-semibold tracking-[0.25em] uppercase text-[#7B5B3A] mb-2 md:mb-3.5 flex items-center transition-all duration-500">
              <span>{currentSlide.eyebrow}</span>
              {currentSlide?.campaign_badge && (
                <span className="ml-2.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#8B4E5A] text-white">
                  {currentSlide.campaign_badge}
                </span>
              )}
            </div>
          )}

          {/* Heading - Only if provided in DB */}
          {currentSlide?.title && (
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[60px] font-bold text-[#2C1D13] leading-[1.06] tracking-normal mb-3 md:mb-4 transition-all duration-500 whitespace-pre-line">
              {currentSlide.title}
            </h1>
          )}

          {/* Subtitle - Only if provided in DB */}
          {currentSlide?.subtitle && (
            <p className="text-sm text-[#3D2B1F] font-medium leading-relaxed mb-6 md:mb-8 max-w-[390px] transition-all duration-500">
              {currentSlide.subtitle}
            </p>
          )}

          {/* CTA Pill Button - Only if provided in DB */}
          {currentSlide?.cta_text && (
            <Link
              href={currentSlide?.cta_url || '/products'}
              className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#3D2B1F] hover:bg-[#5C3D2E] text-white px-8 py-3.5 text-xs md:text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-[0_4px_16px_rgba(61,43,31,0.22)] hover:shadow-[0_6px_22px_rgba(61,43,31,0.32)] hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <span>{currentSlide.cta_text}</span>
           
            </Link>
          )}
        </div>
      </div>

      {/* Desktop Slide Indicators (Only shown if 2+ banners are active) */}
      {total > 1 && (
        <div className="absolute bottom-5 inset-x-0 hidden md:flex items-center justify-center gap-2 z-20 pointer-events-auto">
          {allSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-8 bg-[#2C1D13]'
                  : 'w-2 bg-[#2C1D13]/25 hover:bg-[#2C1D13]/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </section>
  );
}
