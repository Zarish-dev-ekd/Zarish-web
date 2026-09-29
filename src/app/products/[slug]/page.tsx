import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getProductBySlug,
  getRelatedProducts,
  getSiteSettings,
  getAnnouncements,
  getNavigationItems,
  getAllColors,
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
      title: 'Garment Not Found | ZARISH by Nehala Mufeed',
    };
  }

  const primaryImg = product.images?.find((img) => img.role === 'primary') || product.images?.[0];
  const allImages = (product.images || []).map((img) => img.secure_url).filter(Boolean);
  const canonicalUrl = `https://www.zarishbynehalamufeed.com/products/${slug}`;
  const metaDesc =
    product.short_description ||
    product.description ||
    `Shop ${product.name} by ZARISH by Nehala Mufeed. Elegant modest fashion silhouette handcrafted with luxury fabrics.`;

  return {
    title: `${product.name} | ZARISH by Nehala Mufeed`,
    description: metaDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} | ZARISH by Nehala Mufeed`,
      description: metaDesc,
      url: canonicalUrl,
      siteName: 'ZARISH by Nehala Mufeed',
      type: 'website',
      images: allImages.length > 0 ? allImages.map((url) => ({ url })) : [{ url: '/og-image.jpg' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ZARISH by Nehala Mufeed`,
      description: metaDesc,
      images: primaryImg ? [primaryImg.secure_url] : ['/og-image.jpg'],
      creator: '@zarishbynehala',
      site: '@zarishbynehala',
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const [product, settings, announcements, navigationItems, colors] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
    getAnnouncements(),
    getNavigationItems(),
    getAllColors(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category_id, product.id, 4);

  const productImages = (product.images || []).map((img) => img.secure_url).filter(Boolean);
  const primaryImg = product.images?.find((img) => img.role === 'primary') || product.images?.[0];
  const canonicalUrl = `https://www.zarishbynehalamufeed.com/products/${product.slug}`;

  // Product Schema (Merchant Listings & Rich Snippet)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: productImages.length > 0 ? productImages : ['https://www.zarishbynehalamufeed.com/og-image.jpg'],
    description:
      product.short_description ||
      product.description ||
      `Designer modest garment ${product.name} by ZARISH by Nehala Mufeed.`,
    sku: product.sku || product.slug,
    mpn: product.id,
    brand: {
      '@type': 'Brand',
      name: 'ZARISH by Nehala Mufeed',
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.stock_quantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'ZARISH by Nehala Mufeed',
      },
    },
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.zarishbynehalamufeed.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'All Garments',
        item: 'https://www.zarishbynehalamufeed.com/products',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      {/* ─── Heavy Level Organic SEO JSON-LD Schemas ─── */}
      <section className="hidden" aria-hidden="true">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </section>

      <AnnouncementBar announcements={announcements} />
      <Header navigationItems={navigationItems} cartItemCount={0} />

      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-8 pb-16 sm:pb-24">
        <ProductDetailView product={product} settings={settings} colors={colors} />

        {/* Related Garments */}
        {relatedProducts.length > 0 && (
          <section className=" sm:mt-20 sm:pt-14 border-t border-[#E2D5C7]">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C1D13] tracking-wide mb-2">
                YOU MAY ALSO LOVE
              </h2>
              <p className="text-xs sm:text-sm text-[#6B5744]">
                Curated styles to complement your wardrobe
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
