import Link from 'next/link';
import type { Category } from '@/lib/types';
import { IconArrowRight } from '@/components/icons';

interface CategorySectionProps {
  categories: Category[];
  sectionTitle: string;
  sectionSubtitle: string;
  viewAllText: string;
  viewAllUrl: string;
}

export default function CategorySection({
  categories,
  sectionTitle,
  sectionSubtitle,
  viewAllText,
  viewAllUrl,
}: CategorySectionProps) {
  const activeCategories = categories
    .filter((c) => c.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <section className="section" aria-labelledby="category-heading">
      <div className="container">
        <div className="section-heading">
          <h2 id="category-heading" className="section-heading__title">
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="section-heading__subtitle">{sectionSubtitle}</p>
          )}
        </div>

        {activeCategories.length > 0 ? (
          <div className="category-grid">
            {activeCategories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="category-card"
                aria-label={`Explore ${category.name}`}
              >
                <div className="category-card__image">
                  {category.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={category.image_url}
                      alt={category.image_alt || category.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="category-card__placeholder" aria-hidden="true" />
                  )}
                </div>
                <div className="category-card__overlay" aria-hidden="true" />
                <div className="category-card__content">
                  <h3 className="category-card__name">{category.name}</h3>
                  <span className="category-card__cta">
                    {category.cta_label || 'EXPLORE'}
                    <IconArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-state__message">Categories will appear here once configured.</p>
          </div>
        )}

        {viewAllText && viewAllUrl && activeCategories.length > 0 && (
          <div className="view-all-wrapper">
            <Link href={viewAllUrl} className="btn btn--secondary">
              {viewAllText}
              <IconArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
