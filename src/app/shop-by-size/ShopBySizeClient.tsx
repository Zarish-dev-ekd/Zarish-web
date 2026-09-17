'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Product, Size, SiteSettings } from '@/lib/types';
import ProductCard from '@/components/product/ProductCard';
import { IconWhatsapp } from '@/components/icons';

const SORT_OPTIONS: { value: 'newest' | 'price-low' | 'price-high'; label: string }[] = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

interface ShopBySizeClientProps {
  products: Product[];
  sizes: Size[];
  initialSize?: string;
  settings?: SiteSettings | null;
}

export default function ShopBySizeClient({
  products,
  sizes,
  initialSize = '',
  settings,
}: ShopBySizeClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active size slug from state (or synced with URL)
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    return initialSize ? initialSize.toLowerCase() : '';
  });

  const [sortOption, setSortOption] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close custom sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keep state in sync with URL if user navigates back/forward
  useEffect(() => {
    const sizeParam = searchParams.get('size');
    if (sizeParam !== null) {
      setSelectedSize(sizeParam.toLowerCase());
    }
  }, [searchParams]);

  // Compute count of products per size
  const sizeCounts = useMemo(() => {
    const map = new Map<string, number>();
    sizes.forEach((s) => {
      const slug = s.slug.toLowerCase();
      const count = products.filter((p) =>
        p.variants?.some((v) => v.size?.slug?.toLowerCase() === slug)
      ).length;
      map.set(slug, count);
    });
    return map;
  }, [sizes, products]);

  // Filter products based on selected size
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedSize) {
      result = result.filter((p) =>
        p.variants?.some((v) => v.size?.slug?.toLowerCase() === selectedSize)
      );
    }

    // Sort products
    const sorted = [...result];
    if (sortOption === 'price-low') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      sorted.sort((a, b) => b.price - a.price);
    } else {
      // Newest
      sorted.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    }

    return sorted;
  }, [products, selectedSize, sortOption]);

  const handleSelectSize = (slug: string) => {
    const nextSlug = selectedSize === slug ? '' : slug;
    setSelectedSize(nextSlug);

    // Sync URL without a full page refresh
    const params = new URLSearchParams(window.location.search);
    if (nextSlug) {
      params.set('size', nextSlug);
    } else {
      params.delete('size');
    }
    const newUrl = params.toString() ? `/shop-by-size?${params.toString()}` : '/shop-by-size';
    window.history.replaceState(null, '', newUrl);
  };

  const selectedSizeObj = useMemo(() => {
    if (!selectedSize) return null;
    return sizes.find((s) => s.slug.toLowerCase() === selectedSize);
  }, [sizes, selectedSize]);

  const whatsappPhone = settings?.social_whatsapp?.replace(/[^0-9]/g, '') || '';
  const selectedSizeLabel = selectedSizeObj ? selectedSizeObj.name : selectedSize.toUpperCase();

  return (
    <div className="w-full">
      {/* ─── Hero / Header ────────────────────────────────────────────── */}
      <div className="text-center my-6 sm:my-0">
        <span className="text-[11px] tracking-[0.18em] uppercase text-[#7B5B3A] font-semibold">
          PERFECT FIT
        </span>
        <h1 className="font-display my-2 text-2xl sm:text-4xl font-bold text-[#2C1D13] tracking-tight">
          Shop by Size
        </h1>
        <p className="text-xs sm:text-sm  text-[#8C7B6B] max-w-[540px] mx-auto leading-relaxed px-4">
          Discover modest silhouettes crafted to complement your height and proportions with timeless elegance.
        </p>
      </div>

      {/* ─── Size Filter Pills Bar ─────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center">
            {/* All Sizes Button */}
            <button
              type="button"
              onClick={() => handleSelectSize('')}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                !selectedSize
                  ? 'bg-[#613B24] text-white border-[#613B24] shadow-xs'
                  : 'bg-white text-[#2C1D13] border-[#E2D5C7] hover:border-[#613B24] hover:bg-[#FAF6F0]'
              }`}
            >
              All Sizes
            </button>

            {/* Individual Size Pills */}
            {sizes.map((s) => {
              const slug = s.slug.toLowerCase();
              const isSelected = selectedSize === slug;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSize(slug)}
                  aria-pressed={isSelected}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#613B24] text-white border-[#613B24] shadow-xs'
                      : 'bg-white text-[#2C1D13] border-[#E2D5C7] hover:border-[#613B24] hover:bg-[#FAF6F0]'
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Controls Bar: Results Count + Sort ───────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-[#E2D5C7]">
        <div className="text-[13px] text-[#8C7B6B]">
          {selectedSize ? (
            <span className="flex items-center gap-2">
              Showing <strong className="text-[#2C1D13] font-semibold">{filteredProducts.length}</strong>{' '}
              {filteredProducts.length === 1 ? 'garment' : 'garments'} available in{' '}
              <span className="font-semibold text-[#613B24]">Size {selectedSizeLabel}</span>
              <button
                type="button"
                onClick={() => handleSelectSize('')}
                className="ml-2 text-xs text-[#7B5B3A] underline hover:text-[#2C1D13] cursor-pointer"
              >
                Clear
              </button>
            </span>
          ) : (
            <span>
              Showing <strong className="text-[#2C1D13] font-semibold">{filteredProducts.length}</strong> garments across all sizes
            </span>
          )}
        </div>

        {/* Custom Luxury Sort Selector */}
        <div className="relative flex items-center gap-2 self-end sm:self-auto" ref={sortRef}>
          <span className="text-xs text-[#8C7B6B]">
            Sort by:
          </span>
          <button
            type="button"
            onClick={() => setIsSortOpen((prev) => !prev)}
            aria-expanded={isSortOpen}
            aria-haspopup="listbox"
            className="inline-flex items-center justify-between gap-2.5 bg-white border border-[#E2D5C7] hover:border-[#613B24] rounded-full px-3.5 py-1.5 text-xs font-medium text-[#2C1D13] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#613B24]/15"
          >
            <span>{SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label}</span>
            <svg
              className={`w-3.5 h-3.5 text-[#7B5B3A] transition-transform duration-200 ${
                isSortOpen ? 'rotate-180' : ''
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Custom Dropdown Menu */}
          {isSortOpen && (
            <div
              role="listbox"
              className="absolute right-0 top-[calc(100%+6px)] z-40 min-w-[190px] bg-white rounded-2xl border border-[#E8E0D5] shadow-[0_12px_32px_rgba(44,29,19,0.12),0_2px_8px_rgba(44,29,19,0.04)] py-1.5 p-1 transition-all animate-in fade-in zoom-in-95 duration-150"
            >
              {SORT_OPTIONS.map((opt) => {
                const isSelected = opt.value === sortOption;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSortOption(opt.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF6F0] text-[#613B24] font-semibold'
                        : 'text-[#2C1D13] hover:bg-[#F7F1EB]/70 font-normal'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5 text-[#613B24] shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── Product Grid / Empty State ───────────────────────────────── */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-[#FAF7F2] rounded-2xl border border-[#EDE4DC] my-6">
          <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#2C1D13] mb-2">
            No ready garments in Size {selectedSizeLabel}
          </h3>
          <p className="text-xs sm:text-sm text-[#8C7B6B] max-w-[460px] mx-auto leading-relaxed mb-6">
            Looking for custom sizing, length modifications, or bespoke tailoring? All ZARISH designs can be tailored to your measurements directly via WhatsApp.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3">
            <button
              type="button"
              onClick={() => handleSelectSize('')}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-[#2C1D13] text-xs font-medium text-[#2C1D13] hover:bg-[#2C1D13] hover:text-white transition-all cursor-pointer"
            >
              View All Sizes
            </button>
            {whatsappPhone && (
              <a
                href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                  `Hello ZARISH, I am interested in custom tailoring for Size ${selectedSizeLabel}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#613B24] text-white text-xs font-medium hover:bg-[#4E2F1C] transition-all shadow-xs"
              >
                <IconWhatsapp size={14} />
                <span>Custom Sizing Inquiry</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* ─── Sizing Atelier Banner ────────────────────────────────────── */}
      <div className="mt-16 sm:mt-20 p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-[#FAF7F2] to-[#F5EDE4] border border-[#EDE4DC] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-[620px] text-center md:text-left">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#7B5B3A]">
            BESPOKE FIT & LENGTHS
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2C1D13] mt-1 mb-2">
            Need Height or Modesty Adjustments?
          </h2>
          <p className="text-xs sm:text-sm text-[#8C7B6B] leading-relaxed">
            Every ZARISH piece is designed to celebrate individuality. If you need bespoke height alterations, extra flare, or specialized tailoring, our team provides personalized consultations.
          </p>
        </div>

        {whatsappPhone && (
          <a
            href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
              'Hello ZARISH, I would like guidance on sizing and custom fit adjustments.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#613B24] text-white text-xs font-bold tracking-wider uppercase hover:bg-[#4E2F1C] transition-all shadow-md shrink-0"
          >
            <IconWhatsapp size={16} />
            <span>Chat With Stylist</span>
          </a>
        )}
      </div>
    </div>
  );
}
