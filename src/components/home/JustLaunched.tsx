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
      <section className="py-10 md:py-16" aria-labelledby="launched-heading">
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 id="launched-heading" className="font-display text-2xl md:text-3xl font-semibold tracking-wide text-[#2C1D13]">
                {sectionTitle}
              </h2>
              {sectionSubtitle && (
                <p className="font-display italic text-sm text-[#8C7B6B] mt-1">{sectionSubtitle}</p>
              )}
            </div>
          </div>
          <div className="text-center py-16 px-4">
            <p className="text-sm text-[#8C7B6B]">New arrivals will appear here once products are added.</p>
          </div>
        </div>
      </section>
    );
  }

  const displayProducts = products.slice(0, 4);

  return (
    <section className="py-10 md:py-16" aria-labelledby="launched-heading">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 id="launched-heading" className="font-display text-2xl md:text-3xl font-semibold tracking-wide text-[#2C1D13]">
              {sectionTitle}
            </h2>
            {sectionSubtitle && (
              <p className="font-display italic text-sm text-[#8C7B6B] mt-1">{sectionSubtitle}</p>
            )}
          </div>
          {viewAllText && viewAllUrl && (
            <Link href={viewAllUrl} className="group inline-flex items-center gap-2 text-sm font-medium text-[#7B5B3A] tracking-wide hover:gap-3 transition-all">
              <span>{viewAllText}</span>
              <IconArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

