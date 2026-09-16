'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatPrice, optimizeCloudinaryUrl } from '@/lib/utils';
import WishlistButton from '@/components/product/WishlistButton';
import Badge from '@/components/product/Badge';

/* ─── Types ─────────────────────────────────────────────────── */
interface PaginatedResult {
  products: Product[];
  total: number;
  hasMore: boolean;
}

const PAGE_SIZE = 10;
const LOW_STOCK_THRESHOLD = 5;

/* ─── Helpers ───────────────────────────────────────────────── */
function getTotalStock(product: Product): number {
  if (!product.variants || product.variants.length === 0) {
    return product.stock_quantity ?? 0;
  }
  return product.variants.reduce((sum, v) => sum + (v.stock_quantity ?? 0), 0);
}

/* ─── Mini Product Card ─────────────────────────────────────── */
function GridProductCard({ product }: { product: Product }) {
  const primaryImage =
    product.images?.find((img) => img.role === 'primary') || product.images?.[0];
  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.price) / product.compare_at_price!) * 100
      )
    : 0;

  const totalStock = getTotalStock(product);
  const isOutOfStock = totalStock <= 0;
  const isLowStock = !isOutOfStock && totalStock <= LOW_STOCK_THRESHOLD;

  return (
    <article className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-[#F0EBE5] hover:border-[#D8C8BA] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(44,29,19,0.10)] cursor-pointer">
      <Link href={`/products/${product.slug}`} aria-label={product.name} className="block">
        {/* ── Image ── */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F4EF]">
          {primaryImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={optimizeCloudinaryUrl(primaryImage.secure_url, { width: 600 })}
              alt={primaryImage.alt_text || product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full bg-gradient-to-br from-[#F5EDE4] to-[#EAE0D5]"
              aria-hidden="true"
            />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges (Top-Left: Sale) */}
          {product.is_on_sale && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <Badge variant="sale" />
            </div>
          )}

          {/* Top-Right: Wishlist */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <WishlistButton product={product} />
          </div>

          {/* Bottom-Right: Stock Badge (Compact) */}
          <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
            {isOutOfStock ? (
              <span className="inline-flex items-center px-1.5 py-1 rounded text-[9px] font-semibold tracking-wide uppercase leading-none bg-[#8C7B6B]/95 text-white shadow-xs">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center px-1.5 py-1 rounded text-[9px] font-semibold tracking-wide uppercase leading-none bg-[#C0392B]/95 text-white shadow-xs">
                Only {totalStock} left
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-1 rounded text-[9px] font-semibold tracking-wide uppercase leading-none bg-[#0E7064]/95 text-white shadow-xs">
                In Stock
              </span>
            )}
          </div>

          {/* Out-of-stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#8C7B6B]">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="p-3 sm:p-3.5 flex flex-col gap-1.5">
          <h3 className="font-display text-[12.5px] sm:text-[11px] font-semibold text-[#2C1D13] leading-snug line-clamp-1 tracking-[0.01em]">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[14px] sm:text-[15px] font-bold text-[#2C1D13]">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-[11px] sm:text-[12px] text-[#A89585] line-through">
                  {formatPrice(product.compare_at_price!)}
                </span>
                <span className="text-[10px] font-semibold text-[#0E7064] bg-[#E8F5F3] px-1.5 py-0.5 rounded">
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ─── Skeleton Card ─────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#F0EBE5] bg-white animate-pulse">
      <div className="aspect-[3/4] bg-[#F0EBE5]" />
      <div className="p-3.5 flex flex-col gap-2">
        <div className="h-3.5 bg-[#F0EBE5] rounded w-3/4" />
        <div className="h-3 bg-[#F0EBE5] rounded w-1/2" />
        <div className="h-2.5 bg-[#F0EBE5] rounded w-1/3" />
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────── */
export default function FeaturedProductsGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [showInitialOnly, setShowInitialOnly] = useState(true);
  const [infiniteMode, setInfiniteMode] = useState(false);
  const loadingRef = useRef(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  /* ── Fetch page ── */
  const fetchPage = useCallback(async (offset: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products?offset=${offset}&limit=${PAGE_SIZE}`,
        { cache: 'no-store' }
      );
      const json: PaginatedResult = await res.json();
      setProducts((prev) => (offset === 0 ? json.products : [...prev, ...json.products]));
      setTotal(json.total);
      setHasMore(json.hasMore);
      offsetRef.current = offset + json.products.length;
    } catch (e) {
      console.error('Failed to fetch products:', e);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  /* ── Initial load ── */
  useEffect(() => {
    fetchPage(0).then(() => {
      setInitialLoaded(true);
      setShowInitialOnly(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Intersection Observer ── */
  useEffect(() => {
    if (!infiniteMode) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          fetchPage(offsetRef.current);
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [infiniteMode, fetchPage]);

  /* ── "View All" click ── */
  const handleViewAll = () => {
    setShowInitialOnly(false);
    setInfiniteMode(true);
    fetchPage(offsetRef.current);
  };

  const visibleProducts = showInitialOnly ? products.slice(0, PAGE_SIZE) : products;

  if (initialLoaded && products.length === 0 && !loading) return null;

  return (
    <section
      className="w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-white"
      aria-labelledby="featured-products-heading"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <p className="text-[9px] sm:text-[10px] font-semibold tracking-[0.22em] uppercase text-[#8C6352] mb-1">
              EXPLORE THE COLLECTION
            </p>
            <h2
              id="featured-products-heading"
              className="font-display text-xl sm:text-2xl lg:text-[28px] font-bold text-[#2C1D13] tracking-tight leading-tight"
            >
              All Products
            </h2>
            {total > 0 && (
              <p className="text-[11px] text-[#8C7B6B] mt-0.5">
                {total.toLocaleString()} item{total !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-[#874B3E] hover:text-[#6E3A2F] transition-colors"
          >
            Browse All
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Grid */}
        {!initialLoaded ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {visibleProducts.map((product) => (
                <GridProductCard key={product.id} product={product} />
              ))}
              {loading &&
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <SkeletonCard key={`sk-${i}`} />
                ))}
            </div>

            {/* View All button */}
            {showInitialOnly && hasMore && !loading && (
              <div className="mt-8 md:mt-10 flex justify-center">
                <button
                  id="view-all-products-btn"
                  onClick={handleViewAll}
                  className="group inline-flex items-center gap-2.5 px-8 py-3 rounded-full border-2 border-[#874B3E] text-[#874B3E] hover:bg-[#874B3E] hover:text-white text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 hover:shadow-[0_4px_20px_rgba(135,75,62,0.25)] hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span>View All Products</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-y-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Infinite scroll sentinel */}
            {infiniteMode && hasMore && (
              <div ref={sentinelRef} className="h-10" aria-hidden="true" />
            )}

            {/* Loading spinner */}
            {infiniteMode && loading && (
              <div className="mt-8 flex justify-center" aria-label="Loading more products">
                <div className="w-7 h-7 rounded-full border-2 border-[#EBE0D6] border-t-[#874B3E] animate-spin" />
              </div>
            )}

            {/* End of results */}
            {infiniteMode && !hasMore && !loading && products.length > 0 && (
              <div className="mt-10 flex flex-col items-center gap-2">
                <div className="w-12 h-px bg-[#D8C8BA]" />
                <p className="text-[11px] text-[#A89585] font-medium tracking-wider uppercase">
                  You&apos;ve seen all {total} product{total !== 1 ? 's' : ''}
                </p>
                <div className="w-12 h-px bg-[#D8C8BA]" />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
