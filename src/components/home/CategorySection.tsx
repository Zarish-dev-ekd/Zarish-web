'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import type { Category } from '@/lib/types';
import { IconArrowRight } from '@/components/icons';
import { optimizeCloudinaryUrl } from '@/lib/utils';

interface CategorySectionProps {
  categories: Category[];
  sectionTitle: string;
  sectionSubtitle: string;
  viewAllText?: string;
  viewAllUrl?: string;
}

export default function CategorySection({
  categories,
  sectionTitle,
  sectionSubtitle,
}: CategorySectionProps) {
  const activeCategories = categories
    .filter((c) => c.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  // Prepare duplicated list for seamless infinite loop on mobile
  const mobileLoopCategories =
    activeCategories.length <= 4
      ? [...activeCategories, ...activeCategories, ...activeCategories, ...activeCategories]
      : [...activeCategories, ...activeCategories];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fast & Smooth Auto-Slide Loop with Native Touch Swipe support
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || activeCategories.length === 0) return;

    let animId: number;
    // Increased speed: 1.4px per frame (~85px/sec) for brisk, lively auto-slide
    const speed = 1.4;

    const animate = () => {
      if (!isInteracting && el) {
        el.scrollLeft += speed;
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0 && el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        } else if (el.scrollLeft <= 0) {
          el.scrollLeft += halfWidth;
        }
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isInteracting, activeCategories.length]);

  const handleInteractionStart = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    setIsInteracting(true);
  };

  const handleInteractionEnd = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 1200);
  };

  return (
    <section className="py-10 md:py-16" aria-labelledby="category-heading">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="text-center mb-8 md:mb-10">
          <h2 id="category-heading" className="font-display text-2xl md:text-3xl font-semibold tracking-wide text-[#2C1D13] mb-2">
            <span>{sectionTitle}</span>
          </h2>
          {sectionSubtitle && (
            <p className="font-display italic text-sm md:text-base text-[#8C7B6B]">{sectionSubtitle}</p>
          )}
        </div>

        {activeCategories.length > 0 ? (
          <>
            {/* MOBILE VIEW (< md): Swipeable + Fast Auto-Slide Infinite Loop */}
            <div className="md:hidden relative w-full overflow-hidden">
              <div
                ref={scrollRef}
                onTouchStart={handleInteractionStart}
                onTouchEnd={handleInteractionEnd}
                onMouseDown={handleInteractionStart}
                onMouseUp={handleInteractionEnd}
                className="flex gap-2.5 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 px-4 [touch-action:pan-y_pan-x] select-none cursor-grab active:cursor-grabbing [-webkit-overflow-scrolling:touch]"
              >
                {mobileLoopCategories.map((category, idx) => (
                  <Link
                    key={`${category.id}-mob-${idx}`}
                    href={`/category/${category.slug}`}
                    className="group/card relative rounded-2xl overflow-hidden aspect-[3/4] transition-transform duration-300 w-[calc((100vw-36px)/2.35)] min-w-[138px] max-w-[185px] shrink-0"
                    aria-label={`Explore ${category.name}`}
                  >
                    <div className="absolute inset-0 overflow-hidden">
                      {category.image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={optimizeCloudinaryUrl(category.image_url, { width: 400 })}
                          alt={category.image_alt || category.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#F5EDE4] to-[#EAE0D5]" aria-hidden="true" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C1D13]/85 via-[#2C1D13]/30 via-45% to-transparent z-[1]" aria-hidden="true" />
                    <div className="absolute bottom-0 inset-x-0 p-3 z-[2] text-white">
                      <h3 className="font-display text-xs sm:text-sm font-semibold leading-tight mb-1 tracking-wide uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] line-clamp-2">
                        {category.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase text-white/90">
                        <span>{category.cta_label || 'EXPLORE'}</span>
                        <IconArrowRight size={10} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* DESKTOP VIEW (>= md): Centered Flex Row */}
            <div className="hidden md:flex flex-wrap justify-center gap-4 md:gap-5">
              {activeCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group relative rounded-2xl overflow-hidden aspect-[3/4] transition-transform duration-300 hover:-translate-y-1 md:w-[170px] lg:w-[195px] xl:w-[210px] shrink-0"
                  aria-label={`Explore ${category.name}`}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    {category.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={optimizeCloudinaryUrl(category.image_url, { width: 600 })}
                        alt={category.image_alt || category.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#F5EDE4] to-[#EAE0D5]" aria-hidden="true" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C1D13]/85 via-[#2C1D13]/30 via-45% to-transparent z-[1]" aria-hidden="true" />
                  <div className="absolute bottom-0 inset-x-0 p-3 sm:p-3.5 md:p-4 z-[2] text-white">
                    <h3 className="font-display text-xs sm:text-sm md:text-[15px] font-semibold leading-snug mb-1 tracking-wide uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                      {category.name}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-white/90 group-hover:text-white transition-all group-hover:gap-2">
                      <span>{category.cta_label || 'EXPLORE'}</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">
                        <IconArrowRight size={11} />
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 px-4">
            <p className="text-sm text-[#8C7B6B]">Categories will appear here once configured.</p>
          </div>
        )}
      </div>
    </section>
  );
}
