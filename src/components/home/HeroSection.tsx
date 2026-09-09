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
    <section className="relative w-full overflow-hidden bg-[#FAF6F0] min-h-[580px] lg:min-h-[640px] flex items-end md:items-center">
      {/* Mobile Full-Cover Banner Background (<= 768px) */}
      <div className="absolute inset-0 z-0 md:hidden overflow-hidden" aria-hidden="true">
        {mobileImg ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={optimizeCloudinaryUrl(mobileImg, { width: 900 })}
            alt={hero?.image_alt || hero?.title || 'ZARISH Modest Fashion'}
            className="w-full h-full object-cover object-[center_12%]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#F0E4D8] to-[#FAF6F0]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF6F0] via-[#FAF6F0]/95 via-42% to-transparent" />
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

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-14 py-8 md:py-16 min-h-[85vh] md:min-h-[600px] lg:min-h-[640px] flex flex-col justify-end md:justify-center">
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
