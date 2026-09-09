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

  if (!hero) {
    return (
      <section className="hero">
        <div className="hero__inner">
          <div className="hero__content">
            <div className="hero__eyebrow">MODEST FASHION</div>
            <h1 className="hero__title">
              BEAUTY<br />IN MODESTY
            </h1>
            <p className="hero__subtitle">
              Graceful pieces for your everyday and special moments.
            </p>
            <Link href="/products" className="btn btn--primary btn--lg hero__cta">
              EXPLORE COLLECTION
              <IconArrowRight size={16} />
            </Link>
          </div>
          <div className="hero__image">
            <div className="hero__image-placeholder" aria-hidden="true" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero">
      {/* Mobile Full-Cover Banner Background (Active on <= 768px) */}
      <div className="hero__mobile-cover-bg" aria-hidden="true">
        {mobileImg ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={optimizeCloudinaryUrl(mobileImg, { width: 900 })}
            alt={hero.image_alt || hero.title}
            className="hero__mobile-img"
          />
        ) : (
          <div className="hero__image-placeholder" />
        )}
        <div className="hero__mobile-overlay" />
      </div>

      <div className="hero__inner">
        {/* Text Content */}
        <div className="hero__content">
          {hero.eyebrow && (
            <div className="hero__eyebrow">
              {hero.eyebrow}
              {hero.campaign_badge && (
                <span className="hero__badge-pill">{hero.campaign_badge}</span>
              )}
            </div>
          )}

          <h1 className="hero__title">{hero.title}</h1>

          {hero.subtitle && (
            <p className="hero__subtitle">{hero.subtitle}</p>
          )}

          {hero.cta_text && hero.cta_url && (
            <Link href={hero.cta_url} className="btn btn--primary btn--lg hero__cta">
              {hero.cta_text}
              <IconArrowRight size={16} />
            </Link>
          )}

          {/* Value propositions below CTA */}
          <div className="hero__values">
            <div className="hero__value-item">
              <span className="hero__value-number">01</span>
              <span className="hero__value-text">Premium Quality</span>
            </div>
            <div className="hero__value-item">
              <span className="hero__value-number">02</span>
              <span className="hero__value-text">Modest & Modern</span>
            </div>
            <div className="hero__value-item">
              <span className="hero__value-number">03</span>
              <span className="hero__value-text">Made for You</span>
            </div>
          </div>
        </div>

        {/* Desktop Image Column (Hidden on mobile via CSS) */}
        <div className="hero__image hero__image--desktop">
          {desktopImg ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={optimizeCloudinaryUrl(desktopImg, { width: 1400 })}
                alt={hero.image_alt || hero.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {hero.overlay_text && (
                <div className="hero__decorative-text">{hero.overlay_text}</div>
              )}
            </>
          ) : (
            <div className="hero__image-placeholder" aria-hidden="true" />
          )}
        </div>
      </div>
    </section>
  );
}
