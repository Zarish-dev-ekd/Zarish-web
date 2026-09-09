import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getProductBySlug,
  getRelatedProducts,
  getSiteSettings,
  getAnnouncements,
  getNavigationItems,
} from '@/lib/supabase';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductDetailView from '@/components/product/ProductDetailView';
import ProductCard from '@/components/product/ProductCard';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Garment Not Found | ZARISH',
    };
  }

  const primaryImg = product.images?.find((img) => img.role === 'primary') || product.images?.[0];

  return {
    title: `${product.name} | ZARISH by Nehala Mufeed`,
    description: product.short_description || product.description || 'Premium modest fashion garment by ZARISH.',
    openGraph: {
      title: `${product.name} | ZARISH`,
      description: product.short_description || undefined,
      images: primaryImg ? [{ url: primaryImg.secure_url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const [product, settings, announcements, navigationItems] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category_id, product.id, 4);

  return (
    <>
      <AnnouncementBar announcements={announcements} />
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-8 pb-16 sm:pb-24">
        <ProductDetailView product={product} settings={settings} />

        {/* Related Garments */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 sm:mt-20 pt-10 sm:pt-14 border-t border-[#E2D5C7]">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C1D13] tracking-wide mb-2">
                YOU MAY ALSO LOVE
              </h2>
              <p className="text-xs sm:text-sm text-[#6B5744]">
                Curated styles to complement your wardrobe
              </p>
            </div>

            <div className="product-grid">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer
        footerGroups={[]}
        brandDescription={
          settings?.meta_description ||
          'Elegant modest fashion crafted with love. Premium quality pieces for your everyday and special moments.'
        }
        socialLinks={{
          instagram: settings?.social_instagram || undefined,
          facebook: settings?.social_facebook || undefined,
          whatsapp: settings?.social_whatsapp || undefined,
        }}
      />
    </>
  );
}
