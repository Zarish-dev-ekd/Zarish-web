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
    <section className="hero">
      {/* Mobile Full-Cover Banner Background (Active on <= 768px) */}
      <div className="hero__mobile-cover-bg" aria-hidden="true">
        {mobileImg ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={optimizeCloudinaryUrl(mobileImg, { width: 900 })}
            alt={hero?.image_alt || hero?.title || 'ZARISH Modest Fashion'}
            className="hero__mobile-img"
          />
        ) : (
          <div className="hero__image-placeholder" />
        )}
        <div className="hero__mobile-overlay" />
      </div>

      {/* Desktop Full-Cover Banner Background (Active on > 768px) */}
      <div className="hero__desktop-cover-bg" aria-hidden="true">
        {desktopImg ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={optimizeCloudinaryUrl(desktopImg, { width: 1920 })}
            alt={hero?.image_alt || hero?.title || 'ZARISH Modest Fashion'}
            className="hero__desktop-img"
          />
        ) : (
          <div className="hero__image-placeholder" />
        )}
        <div className="hero__desktop-overlay" />
      </div>

      <div className="hero__inner">
        {/* Left Content Column */}
        <div className="hero__content">
          <div className="hero__eyebrow">
            {hero?.eyebrow || 'MODEST FASHION'}
            {hero?.campaign_badge && (
              <span className="hero__badge-pill">{hero.campaign_badge}</span>
            )}
          </div>

          <h1 className="hero__title">
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

          <p className="hero__subtitle">
            {hero?.subtitle || 'Graceful pieces for your everyday and special moments.'}
          </p>

          <Link
            href={hero?.cta_url || '/products'}
            className="btn btn--primary btn--lg hero__cta"
          >
            {hero?.cta_text || 'SHOP NEW ARRIVALS'}
            <IconArrowRight size={16} />
          </Link>

          {/* Value propositions with vertical dividers matching reference */}
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

        {/* Floating handwritten cursive script on right (as in reference photo 2) */}
        <aside className="hero__floating-script" aria-hidden="true">
          {hero?.overlay_text ? (
            <div className="hero__script-lines">
              {hero.overlay_text.split('\n').map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </div>
          ) : (
            <div className="hero__script-lines">
              <span>Modesty</span>
              <span>Looks</span>
              <span>Beautiful</span>
              <span className="hero__script-heart">On You ♡</span>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
