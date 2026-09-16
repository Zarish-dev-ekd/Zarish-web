import Link from 'next/link';
import type { BrandStoryData } from '@/lib/types';
import { IconArrowRight } from '@/components/icons';

interface BrandStoryProps {
  story: BrandStoryData | null;
}

export default function BrandStory({ story }: BrandStoryProps) {
  if (!story || !story.is_active) return null;

  return (
    <section className="bg-[#F3ECE2] py-10 md:py-16" aria-labelledby="brand-story-heading">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="rounded-2xl overflow-hidden aspect-square md:aspect-[4/5]">
          {story.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={story.image_url}
              alt={story.image_alt || 'About ZARISH'}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#F5EDE4] to-[#EAE0D5]" aria-hidden="true" />
          )}
        </div>

        <div className="max-w-[480px]">
          {story.eyebrow && (
            <span className="block text-xs font-medium tracking-widest uppercase text-[#8C7B6B] mb-4">{story.eyebrow}</span>
          )}
          <h2 id="brand-story-heading" className="font-display text-2xl md:text-4xl font-semibold leading-tight text-[#2C1D13] mb-6">
            {story.title}
          </h2>
          {story.description && (
            <p className="text-sm md:text-base leading-relaxed text-[#5C4A3E] mb-8">{story.description}</p>
          )}
          {story.cta_text && story.cta_url && (
            <Link href={story.cta_url} className="inline-flex items-center justify-center gap-2 font-medium tracking-wide uppercase rounded-full transition-all whitespace-nowrap cursor-pointer text-sm px-8 py-3 bg-[#3D2B1F] text-white hover:bg-[#7B5B3A] hover:-translate-y-0.5 hover:shadow-md">
              {story.cta_text}
              <IconArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
