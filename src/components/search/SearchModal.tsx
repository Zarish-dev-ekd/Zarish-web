'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { formatPrice, optimizeCloudinaryUrl } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { IconSearch, IconX, IconChevronRight } from '@/components/icons';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  'Abaya',
  'Kaftan',
  'Modest Dresses',
  'Co-ords',
  'Silk',
  'Black Abaya',
  'New Arrivals',
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input and lock body scroll on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
      }, 120);

      // Fetch recommended/trending products if not already loaded
      if (suggestedProducts.length === 0) {
        supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            compare_at_price,
            is_new_arrival,
            is_on_sale,
            category:categories(name, slug),
            images:product_images(secure_url, role, alt_text)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(4)
          .then(({ data }) => {
            if (data) {
              setSuggestedProducts(data as unknown as Product[]);
            }
          });
      }
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, supabase, suggestedProducts.length]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Perform search query
  const performSearch = useCallback(
    async (searchTerm: string) => {
      const term = searchTerm.trim();
      if (!term) {
        setResults([]);
        setLoading(false);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            compare_at_price,
            is_new_arrival,
            is_on_sale,
            category:categories(name, slug),
            images:product_images(secure_url, role, alt_text)
          `)
          .eq('is_active', true)
          .ilike('name', `%${term}%`)
          .limit(8);

        if (error) throw error;
        setResults((data as unknown as Product[]) || []);
      } catch (err) {
        console.error('Live search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Debounced input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!val.trim()) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(() => {
      performSearch(val);
    }, 200);
  };

  const handleSelectPill = (term: string) => {
    setQuery(term);
    performSearch(term);
    inputRef.current?.focus();
  };

  const handleSelectProduct = (slug: string) => {
    onClose();
    router.push(`/products/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] bg-[#FAF6F0]/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search garments"
    >
      <div
        className="max-w-3xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-14 pb-16 min-h-screen flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navigation Row: Close Button */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#7B5B3A]">
            ZARISH • Search
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#2C1D13] border border-[#E2D5C7] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Minimal Luxury Search Input */}
        <div className="relative mb-6 sm:mb-8">
          <div className="flex items-center gap-3 border-b border-[#2C1D13] pb-2.5 sm:pb-3 transition-colors">
            <span className="text-[#7B5B3A] shrink-0">
              <IconSearch size={20} />
            </span>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search by garment, abaya, fabric, style..."
              className="w-full bg-transparent text-sm sm:text-base md:text-lg text-[#2C1D13] placeholder-[#A89887]/60 focus:outline-none font-medium"
            />

            {loading && (
              <span className="w-4 h-4 border-2 border-[#7B5B3A]/30 border-t-[#7B5B3A] rounded-full animate-spin shrink-0" />
            )}

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setHasSearched(false);
                  inputRef.current?.focus();
                }}
                className="w-6 h-6 rounded-full bg-[#E2D5C7]/80 hover:bg-[#2C1D13] text-[#2C1D13] hover:text-white flex items-center justify-center transition-all shrink-0 text-xs cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results & Suggestions */}
        <div className="flex-1">
          {/* 1. Results View */}
          {hasSearched && !loading && results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#8C7B6B] mb-3">
                <span className="uppercase tracking-wider font-semibold">
                  Garments Found ({results.length})
                </span>
                <span>Select to view garment</span>
              </div>

              <div className="space-y-2.5">
                {results.map((product) => {
                  const primaryImg =
                    product.images?.find((img) => img.role === 'primary') || product.images?.[0];
                  const hasDiscount =
                    product.compare_at_price && product.compare_at_price > product.price;

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product.slug)}
                      className="group flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white/90 hover:bg-white border border-[#E2D5C7]/80 hover:border-[#7B5B3A] shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#FAF6F0] border border-[#E2D5C7]/70 overflow-hidden shrink-0 flex items-center justify-center">
                          {primaryImg ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={optimizeCloudinaryUrl(primaryImg.secure_url, { width: 140 })}
                              alt={primaryImg.alt_text || product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <span className="text-xl">✨</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          {product.category?.name && (
                            <span className="text-[10px] font-bold tracking-wider uppercase text-[#7B5B3A] block mb-0.5">
                              {product.category.name}
                            </span>
                          )}
                          <h4 className="font-semibold text-sm sm:text-base text-[#2C1D13] group-hover:text-[#7B5B3A] transition-colors truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs sm:text-sm font-bold text-[#2C1D13]">
                              {formatPrice(product.price)}
                            </span>
                            {hasDiscount && (
                              <span className="text-[11px] text-[#A89887] line-through">
                                {formatPrice(product.compare_at_price!)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="w-9 h-9 rounded-full bg-[#FAF6F0] group-hover:bg-[#2C1D13] group-hover:text-white text-[#8C7B6B] flex items-center justify-center transition-all shrink-0 ml-3">
                        <IconChevronRight size={15} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. No Results State */}
          {hasSearched && !loading && results.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="w-14 h-14 rounded-full bg-white/90 text-[#7B5B3A] border border-[#E2D5C7] flex items-center justify-center mx-auto mb-4 text-xl shadow-xs">
                <IconSearch size={24} />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-[#2C1D13] mb-2">
                No garments found for &ldquo;{query}&rdquo;
              </h3>
              <p className="text-xs sm:text-sm text-[#8C7B6B] max-w-sm mx-auto mb-6 leading-relaxed">
                We couldn&apos;t find any match. Try checking the spelling or browse our popular
                categories below.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectPill(term)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/90 hover:bg-[#2C1D13] text-[#4A3728] hover:text-white border border-[#E2D5C7] transition-all shadow-xs cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Empty Query State (Popular Searches & Suggested Garments) */}
          {!hasSearched && (
            <div className="space-y-6 sm:space-y-8">
              {/* Popular Search Pills (without #) */}
              <div>
                <span className="block text-[11px] font-semibold tracking-wider uppercase text-[#8C7B6B] mb-2.5">
                  Popular Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSelectPill(term)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/90 hover:bg-[#2C1D13] text-[#4A3728] hover:text-white border border-[#E2D5C7] transition-all shadow-xs cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommended / Trending Garments */}
              {suggestedProducts.length > 0 && (
                <div className="pt-6 border-t border-[#E2D5C7]/60">
                  <span className="block text-xs font-semibold tracking-wider uppercase text-[#8C7B6B] mb-4">
                    Curated For You
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestedProducts.map((product) => {
                      const primaryImg =
                        product.images?.find((img) => img.role === 'primary') || product.images?.[0];

                      return (
                        <div
                          key={product.id}
                          onClick={() => handleSelectProduct(product.slug)}
                          className="group flex items-center gap-3.5 p-3 rounded-2xl bg-white/90 hover:bg-white border border-[#E2D5C7]/70 hover:border-[#7B5B3A] transition-all shadow-xs cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] overflow-hidden shrink-0 border border-[#E2D5C7]/50">
                            {primaryImg ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={optimizeCloudinaryUrl(primaryImg.secure_url, { width: 120 })}
                                alt={primaryImg.alt_text || product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#FAF6F0]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs sm:text-sm font-semibold text-[#2C1D13] group-hover:text-[#7B5B3A] transition-colors truncate">
                              {product.name}
                            </h5>
                            <span className="text-xs font-bold text-[#7B5B3A]">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Clean Link */}
        <div className="mt-12 text-center pt-6 border-t border-[#E2D5C7]/40">
          <Link
            href="/products"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7B5B3A] hover:text-[#2C1D13] transition-colors"
          >
            <span>Browse Entire Collection</span>
            <IconChevronRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
