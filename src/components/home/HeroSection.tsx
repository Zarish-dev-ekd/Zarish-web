'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { HeroSlide } from '@/lib/types';
import { IconArrowRight, IconChevronLeft, IconChevronRight } from '@/components/icons';
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
  const [isPaused, setIsPaused] = useState(false);
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
    if (total <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      goToNext();
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused, goToNext]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      setIsPaused(false);
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setIsPaused(false);
  };

  if (total === 0) {
    return (
      <section className="relative w-full bg-[#FAF6F0] min-h-[500px] flex items-center justify-center">
        <p className="text-sm tracking-widest text-[#7B5B3A] uppercase">ZARISH BY NEHALA MUFEED</p>
      </section>
    );
  }

  const currentSlide = allSlides[currentIndex];

  return (
    <section
      className="relative w-full overflow-hidden bg-[#FAF6F0] min-h-[580px] md:min-h-[600px] lg:min-h-[640px] flex items-end md:items-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
                  className={`w-full h-full object-cover object-center transition-transform duration-1000 ease-out ${
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
      <div className="relative z-10 w-full md:hidden flex flex-col justify-end px-5 sm:px-8 pb-7 pt-16">
        {/* Floating Calligraphy - Natural Handwriting on Drapery (No Clunky Boxes) */}
        <aside
          className="absolute top-4 right-4 z-20 pointer-events-none select-none -rotate-3 transition-all duration-500"
          aria-hidden="true"
        >
          {currentSlide?.overlay_text ? (
            <div className="flex flex-col font-script text-xl sm:text-2xl text-[#6B4832] drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] leading-tight text-right">
              {currentSlide.overlay_text.split('\n').map((line, i) => (
                <span
                  key={i}
                  className={line.includes('♡') || line.includes('You') ? 'text-[#8B4E5A] font-semibold' : ''}
                >
                  {line}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex flex-col font-script text-xl sm:text-2xl text-[#6B4832] drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] leading-tight text-right">
              <span>Modesty</span>
              <span>Looks</span>
              <span>Beautiful</span>
              <span className="text-[#8B4E5A] font-semibold whitespace-nowrap">On You ♡</span>
            </div>
          )}
        </aside>

        {/* Eyebrow */}
        <div className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#7B5B3A] mb-1.5 flex items-center transition-all duration-500">
          <span>{currentSlide?.eyebrow || 'MODEST FASHION'}</span>
          {currentSlide?.campaign_badge && (
            <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-[#8B4E5A] text-white">
              {currentSlide.campaign_badge}
            </span>
          )}
        </div>

        {/* Heading */}
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2C1D13] leading-[1.08] tracking-normal mb-2 transition-all duration-500 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
          {currentSlide?.title ? (
            currentSlide.title.toUpperCase().includes('IN MODESTY') ? (
              <>
                BEAUTY<br />IN MODESTY
              </>
            ) : (
              currentSlide.title
            )
          ) : (
            <>
              BEAUTY<br />IN MODESTY
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#3D2B1F] font-medium leading-relaxed mb-4 max-w-[340px] transition-all duration-500 drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]">
          {currentSlide?.subtitle || 'Graceful pieces for your everyday and special moments.'}
        </p>

        {/* CTA Button - Sleek Luxury Pill */}
        <Link
          href={currentSlide?.cta_url || '/products'}
          className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#2C1D13] hover:bg-[#3D2B1F] text-white px-7 py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-[0_4px_16px_rgba(44,29,19,0.22)] w-full sm:w-auto mb-5"
        >
          <span>{currentSlide?.cta_text || 'SHOP NEW ARRIVALS'}</span>
          <IconArrowRight size={14} />
        </Link>

        {/* Value Propositions with Clean Vertical Dividers */}
        <div className="pt-3.5 border-t border-[#3D2B1F]/15 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center text-center pr-2 border-r border-[#3D2B1F]/20">
            <span className="font-display text-sm sm:text-base font-bold text-[#2C1D13] leading-none mb-0.5">01</span>
            <span className="text-[9px] sm:text-[10px] font-medium text-[#7B6858] leading-tight tracking-wide">Premium<br />Quality</span>
          </div>
          <div className="flex flex-col items-center text-center pr-2 border-r border-[#3D2B1F]/20">
            <span className="font-display text-sm sm:text-base font-bold text-[#2C1D13] leading-none mb-0.5">02</span>
            <span className="text-[9px] sm:text-[10px] font-medium text-[#7B6858] leading-tight tracking-wide">Modest &<br />Modern</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="font-display text-sm sm:text-base font-bold text-[#2C1D13] leading-none mb-0.5">03</span>
            <span className="text-[9px] sm:text-[10px] font-medium text-[#7B6858] leading-tight tracking-wide">Made for<br />You</span>
          </div>
        </div>

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
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-14 py-8 md:py-16 min-h-[600px] lg:min-h-[640px] hidden md:flex flex-col justify-center">
        {/* Left Column Text */}
        <div className="w-full md:max-w-md lg:max-w-lg flex flex-col justify-center">
          {/* Eyebrow */}
          <div className="text-[11px] md:text-xs font-semibold tracking-[0.25em] uppercase text-[#7B5B3A] mb-2 md:mb-3.5 flex items-center transition-all duration-500">
            <span>{currentSlide?.eyebrow || 'MODEST FASHION'}</span>
            {currentSlide?.campaign_badge && (
              <span className="ml-2.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#8B4E5A] text-white">
                {currentSlide.campaign_badge}
              </span>
            )}
          </div>

          {/* Heading */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-[60px] font-bold text-[#2C1D13] leading-[1.06] tracking-normal mb-3 md:mb-4 transition-all duration-500 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
          {currentSlide?.title ? (
            currentSlide.title.toUpperCase().includes('IN MODESTY') ? (
              <>
                BEAUTY<br />IN MODESTY
              </>
            ) : (
              currentSlide.title
            )
          ) : (
            <>
              BEAUTY<br />IN MODESTY
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-[#3D2B1F] font-medium leading-relaxed mb-6 md:mb-8 max-w-[390px] transition-all duration-500 drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]">
          {currentSlide?.subtitle || 'Graceful pieces for your everyday and special moments.'}
        </p>

          {/* CTA Pill Button */}
          <Link
            href={currentSlide?.cta_url || '/products'}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#3D2B1F] hover:bg-[#5C3D2E] text-white px-8 py-3.5 text-xs md:text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-[0_4px_16px_rgba(61,43,31,0.22)] hover:shadow-[0_6px_22px_rgba(61,43,31,0.32)] hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <span>{currentSlide?.cta_text || 'SHOP NEW ARRIVALS'}</span>
            <IconArrowRight size={16} />
          </Link>

          {/* Value Propositions with Vertical Dividers */}
          <div className="mt-6 md:mt-11 pt-4 md:pt-2 border-t border-[#3D2B1F]/15 md:border-t-0 grid grid-cols-3 md:flex md:items-start gap-2 md:gap-8">
            <div className="flex flex-col items-center text-center md:items-start md:text-left pr-2 md:pr-8 border-r border-[#3D2B1F]/20">
              <span className="font-display text-base md:text-xl font-bold text-[#2C1D13] leading-none mb-1">01</span>
              <span className="text-[10px] md:text-xs font-medium text-[#7B6858] leading-tight tracking-wide">Premium<br />Quality</span>
            </div>
            <div className="flex flex-col items-center text-center md:items-start md:text-left pr-2 md:pr-8 border-r border-[#3D2B1F]/20">
              <span className="font-display text-base md:text-xl font-bold text-[#2C1D13] leading-none mb-1">02</span>
              <span className="text-[10px] md:text-xs font-medium text-[#7B6858] leading-tight tracking-wide">Modest &<br />Modern</span>
            </div>
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <span className="font-display text-base md:text-xl font-bold text-[#2C1D13] leading-none mb-1">03</span>
              <span className="text-[10px] md:text-xs font-medium text-[#7B6858] leading-tight tracking-wide">Made for<br />You</span>
            </div>
          </div>
        </div>

        {/* Floating Handwritten Calligraphy Script (Upper Right) */}
        <aside
          className="absolute top-5 right-5 sm:top-8 sm:right-8 md:top-14 md:right-10 lg:right-16 z-20 pointer-events-none select-none -rotate-6 transition-all duration-500"
          aria-hidden="true"
        >
          {currentSlide?.overlay_text ? (
            <div className="flex flex-col font-script text-xl sm:text-2xl md:text-3xl lg:text-[40px] text-[#6B4832] drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] leading-tight text-right">
              {currentSlide.overlay_text.split('\n').map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </div>
          ) : (
            <div className="flex flex-col font-script text-xl sm:text-2xl md:text-3xl lg:text-[40px] text-[#6B4832] drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] leading-tight text-right">
              <span>Modesty</span>
              <span>Looks</span>
              <span>Beautiful</span>
              <span className="whitespace-nowrap">On You ♡</span>
            </div>
          )}
        </aside>

        {/* Desktop Carousel Controls: Prev/Next Floating Arrows & Indicators (Only when 2+ slides exist) */}
        {total > 1 && (
          <>
            {/* Prev Arrow */}
            <button
              type="button"
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/75 hover:bg-white text-[#2C1D13] backdrop-blur-md shadow-[0_4px_16px_rgba(44,29,19,0.12)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Previous slide"
            >
              <IconChevronLeft size={20} />
            </button>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/75 hover:bg-white text-[#2C1D13] backdrop-blur-md shadow-[0_4px_16px_rgba(44,29,19,0.12)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Next slide"
            >
              <IconChevronRight size={20} />
            </button>

            {/* Desktop Slide Indicators */}
            <div className="absolute bottom-6 left-6 sm:left-8 lg:left-14 z-30 flex items-center gap-2.5">
              {allSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-10 bg-[#2C1D13]'
                      : 'w-2.5 bg-[#2C1D13]/25 hover:bg-[#2C1D13]/55'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={idx === currentIndex ? 'true' : 'false'}
                />
              ))}
              <span className="ml-3 text-[11px] font-semibold tracking-wider text-[#7B5B3A]">
                0{currentIndex + 1} / 0{total}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
