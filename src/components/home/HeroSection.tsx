import Link from 'next/link';
import type { HeroSlide } from '@/lib/types';
import { IconArrowRight } from '@/components/icons';
import { optimizeCloudinaryUrl } from '@/lib/utils';

interface HeroSectionProps {
  hero: HeroSlide | null;
}

export default function HeroSection({ hero }: HeroSectionProps) {
  const desktopImg = hero?.image_url;
  const mobileImg = hero?.mobile_image_url || hero?.image_url;

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF6F0] min-h-[85vh] sm:min-h-[580px] md:min-h-[600px] lg:min-h-[640px] flex items-end md:items-center">
      {/* Mobile Full-Cover Banner Background (<= 768px) */}
      <div className="absolute inset-0 z-0 md:hidden overflow-hidden pointer-events-none" aria-hidden="true">
        {mobileImg ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={optimizeCloudinaryUrl(mobileImg, { width: 900 })}
            alt={hero?.image_alt || hero?.title || 'ZARISH Modest Fashion'}
            className="w-full h-full object-cover object-[center_top]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#F0E4D8] to-[#FAF6F0]" />
        )}
        {/* Soft header vignette at top for navigation clarity */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#FAF6F0]/70 via-[#FAF6F0]/20 to-transparent pointer-events-none" />
        {/* Soft bottom grounding behind the card */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#FAF6F0]/80 to-transparent pointer-events-none" />
      </div>

      {/* Desktop Full-Cover Banner Background (> 768px) */}
      <div className="absolute inset-0 z-0 hidden md:block overflow-hidden pointer-events-none" aria-hidden="true">
        {desktopImg ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={optimizeCloudinaryUrl(desktopImg, { width: 1920 })}
            alt={hero?.image_alt || hero?.title || 'ZARISH Modest Fashion'}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#F0E4D8] to-[#FAF6F0]" />
        )}
        {/* Soft translucent gradient to protect text contrast while keeping florals visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF6F0]/90 via-[#FAF6F0]/80 via-30% via-[#FAF6F0]/40 via-50% to-transparent to-70%" />
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MOBILE HERO VIEW (<= 768px): Dedicated Haute-Couture Layout  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full md:hidden flex flex-col justify-end h-full px-3.5 sm:px-5 pb-4 pt-16">
        {/* Floating Calligraphy Designer Stamp (Top Right) */}
        <aside
          className="absolute top-4 right-4 z-20 pointer-events-none select-none"
          aria-hidden="true"
        >
          <div className="backdrop-blur-md bg-white/80 border border-white/90 shadow-[0_4px_16px_rgba(44,29,19,0.08)] px-3.5 py-1.5 rounded-2xl -rotate-2">
            <div className="flex flex-col font-script text-[15px] sm:text-base text-[#6B4832] leading-tight text-center">
              {hero?.overlay_text ? (
                hero.overlay_text.split('\n').map((line, i) => (
                  <span
                    key={i}
                    className={line.includes('♡') || line.includes('You') ? 'text-[#8B4E5A] font-semibold' : ''}
                  >
                    {line}
                  </span>
                ))
              ) : (
                <>
                  <span>Modesty Looks</span>
                  <span className="text-[#8B4E5A] font-semibold text-xs mt-0.5">Beautiful On You ♡</span>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Floating Luxury Frosted Glass Bottom Card */}
        <div className="w-full rounded-[24px] bg-[#FAF6F0]/92 backdrop-blur-xl border border-white/80 shadow-[0_12px_36px_rgba(44,29,19,0.12)] p-4 sm:p-5 flex flex-col">
          {/* Eyebrow Capsule */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/85 border border-[#7B5B3A]/25 text-[#7B5B3A] text-[10px] font-bold tracking-[0.2em] uppercase shadow-xs">
              <span className="text-[#8B4E5A] text-xs">✦</span>
              {hero?.eyebrow || 'MODEST FASHION'}
            </span>
            {hero?.campaign_badge && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#8B4E5A] text-white shadow-xs">
                {hero.campaign_badge}
              </span>
            )}
          </div>

          {/* Headline */}
          <h1 className="font-display text-[26px] sm:text-[30px] font-bold text-[#2C1D13] leading-[1.08] tracking-tight mb-1.5">
            {hero?.title ? (
              hero.title.toUpperCase().includes('IN MODESTY') ? (
                <>
                  BEAUTY IN <span className="font-serif italic font-normal text-[#7B5B3A]">MODESTY</span>
                </>
              ) : (
                hero.title
              )
            ) : (
              <>
                BEAUTY IN <span className="font-serif italic font-normal text-[#7B5B3A]">MODESTY</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-xs text-[#6B5744] leading-relaxed mb-3.5 max-w-sm">
            {hero?.subtitle || 'Graceful pieces for your everyday and special moments.'}
          </p>

          {/* CTA Pill Button */}
          <Link
            href={hero?.cta_url || '/products'}
            className="w-full flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#2C1D13] via-[#3E281C] to-[#2C1D13] text-[#FAF6F0] py-3.5 px-5 text-xs font-bold tracking-[0.16em] uppercase shadow-[0_6px_18px_rgba(44,29,19,0.22)] active:scale-[0.98] transition-all duration-300 group"
          >
            <span>{hero?.cta_text || 'SHOP NEW ARRIVALS'}</span>
            <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:translate-x-1">
              <IconArrowRight size={11} className="text-white" />
            </span>
          </Link>

          {/* 3 Luxury Mini Perk Cards */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-[#3D2B1F]/10">
            <div className="flex flex-col items-center text-center py-1.5 px-1 rounded-xl bg-white/60 border border-[#E2D5C7]/60 shadow-xs">
              <span className="font-display text-xs font-bold text-[#2C1D13]">01</span>
              <span className="text-[9px] font-semibold text-[#7B5B3A] tracking-wider uppercase mt-0.5">Premium</span>
              <span className="text-[8px] text-[#8C7B6B] leading-tight">Quality Silk</span>
            </div>
            <div className="flex flex-col items-center text-center py-1.5 px-1 rounded-xl bg-white/60 border border-[#E2D5C7]/60 shadow-xs">
              <span className="font-display text-xs font-bold text-[#2C1D13]">02</span>
              <span className="text-[9px] font-semibold text-[#7B5B3A] tracking-wider uppercase mt-0.5">Modest</span>
              <span className="text-[8px] text-[#8C7B6B] leading-tight">& Modern</span>
            </div>
            <div className="flex flex-col items-center text-center py-1.5 px-1 rounded-xl bg-white/60 border border-[#E2D5C7]/60 shadow-xs">
              <span className="font-display text-xs font-bold text-[#2C1D13]">03</span>
              <span className="text-[9px] font-semibold text-[#7B5B3A] tracking-wider uppercase mt-0.5">Tailored</span>
              <span className="text-[8px] text-[#8C7B6B] leading-tight">For You</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DESKTOP HERO VIEW (> 768px): Original Full Panorama Layout     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-14 py-8 md:py-16 min-h-[600px] lg:min-h-[640px] hidden md:flex flex-col justify-center">
        {/* Left Column Text */}
        <div className="w-full md:max-w-md lg:max-w-lg flex flex-col justify-center">
          {/* Eyebrow */}
          <div className="text-[11px] md:text-xs font-semibold tracking-[0.25em] uppercase text-[#7B5B3A] mb-2 md:mb-3.5 flex items-center">
            {hero?.eyebrow || 'MODEST FASHION'}
            {hero?.campaign_badge && (
              <span className="ml-2.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#8B4E5A] text-white">
                {hero.campaign_badge}
              </span>
            )}
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[60px] font-bold text-[#2C1D13] leading-[1.06] tracking-normal mb-3 md:mb-4">
            {hero?.title ? (
              hero.title.toUpperCase().includes('IN MODESTY') ? (
                <>
                  BEAUTY<br />IN MODESTY
                </>
              ) : (
                hero.title
              )
            ) : (
              <>
                BEAUTY<br />IN MODESTY
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-[#6B5744] leading-relaxed mb-6 md:mb-8 max-w-[390px]">
            {hero?.subtitle || 'Graceful pieces for your everyday and special moments.'}
          </p>

          {/* CTA Pill Button */}
          <Link
            href={hero?.cta_url || '/products'}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#3D2B1F] hover:bg-[#5C3D2E] text-white px-8 py-3.5 text-xs md:text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-[0_4px_16px_rgba(61,43,31,0.22)] hover:shadow-[0_6px_22px_rgba(61,43,31,0.32)] hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <span>{hero?.cta_text || 'SHOP NEW ARRIVALS'}</span>
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
          className="absolute top-5 right-5 sm:top-8 sm:right-8 md:top-14 md:right-10 lg:right-16 z-20 pointer-events-none select-none -rotate-6"
          aria-hidden="true"
        >
          {hero?.overlay_text ? (
            <div className="flex flex-col font-script text-xl sm:text-2xl md:text-3xl lg:text-[40px] text-[#6B4832] drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] leading-tight">
              {hero.overlay_text.split('\n').map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </div>
          ) : (
            <div className="flex flex-col font-script text-xl sm:text-2xl md:text-3xl lg:text-[40px] text-[#6B4832] drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] leading-tight">
              <span>Modesty</span>
              <span>Looks</span>
              <span>Beautiful</span>
              <span className="whitespace-nowrap">On You ♡</span>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
