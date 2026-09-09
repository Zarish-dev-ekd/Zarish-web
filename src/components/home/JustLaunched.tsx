import Link from 'next/link';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/product/ProductCard';
import { IconArrowRight } from '@/components/icons';

interface JustLaunchedProps {
  products: Product[];
  sectionTitle: string;
  sectionSubtitle: string;
  viewAllText: string;
  viewAllUrl: string;
}

export default function JustLaunched({
  products,
  sectionTitle,
  sectionSubtitle,
  viewAllText,
  viewAllUrl,
}: JustLaunchedProps) {
  if (products.length === 0) {
    return (
      <section className="section" aria-labelledby="launched-heading">
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 id="launched-heading" className="section-header-row__title">
                {sectionTitle}
              </h2>
              {sectionSubtitle && (
                <p className="section-header-row__subtitle">{sectionSubtitle}</p>
              )}
            </div>
          </div>
          <div className="empty-state">
            <p className="empty-state__message">New arrivals will appear here once products are added.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" aria-labelledby="launched-heading">
      <div className="container">
        <div className="section-header-row">
          <div>
            <h2 id="launched-heading" className="section-header-row__title">
              {sectionTitle}
            </h2>
            {sectionSubtitle && (
              <p className="section-header-row__subtitle">{sectionSubtitle}</p>
            )}
          </div>
          {viewAllText && viewAllUrl && (
            <Link href={viewAllUrl} className="section-header-row__link">
              {viewAllText}
              <IconArrowRight size={14} />
            </Link>
          )}
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
