import Link from 'next/link';
import type { BrandStoryData } from '@/lib/types';
import { IconArrowRight } from '@/components/icons';

interface BrandStoryProps {
  story: BrandStoryData | null;
}

export default function BrandStory({ story }: BrandStoryProps) {
  if (!story || !story.is_active) return null;

  return (
    <section className="brand-story section" aria-labelledby="brand-story-heading">
      <div className="brand-story__inner">
        <div className="brand-story__image">
          {story.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={story.image_url}
              alt={story.image_alt || 'About ZARISH'}
              loading="lazy"
            />
          ) : (
            <div className="brand-story__image-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="brand-story__content">
          {story.eyebrow && (
            <span className="brand-story__eyebrow">{story.eyebrow}</span>
          )}
          <h2 id="brand-story-heading" className="brand-story__title">
            {story.title}
          </h2>
          {story.description && (
            <p className="brand-story__description">{story.description}</p>
          )}
          {story.cta_text && story.cta_url && (
            <Link href={story.cta_url} className="btn btn--primary brand-story__cta">
              {story.cta_text}
              <IconArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
