'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice, getDiscountPercent, optimizeCloudinaryUrl } from '@/lib/utils';
import { IconArrowRight, IconTruck, IconShield, IconPackage, IconWhatsapp } from '@/components/icons';
import Badge from './Badge';
import WishlistButton from './WishlistButton';
import type { Product, SiteSettings } from '@/lib/types';

interface ProductDetailViewProps {
  product: Product;
  settings: SiteSettings | null;
}

export default function ProductDetailView({ product, settings }: ProductDetailViewProps) {
  // Gallery images (fallback to single image if none)
  const images = product.images && product.images.length > 0 ? product.images : [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Variants and sizes
  const availableSizes =
    product.variants
      ?.filter((v) => v.is_active && v.size)
      .map((v) => v.size!) || [];

  const [selectedSize, setSelectedSize] = useState<string>(
    availableSizes.length > 0 ? availableSizes[0].name : 'Standard'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'shipping'>('details');

  const activeImage = images[activeImageIndex];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? getDiscountPercent(product.price, product.compare_at_price!)
    : 0;

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // WhatsApp order link generation
  const cleanPhone = settings?.social_whatsapp
    ? settings.social_whatsapp.replace(/[^0-9]/g, '')
    : '919876543210';

  const orderMessage = encodeURIComponent(
    `Hello ZARISH by Nehala Mufeed! 👋\n\nI would like to order:\n` +
      `• Product: *${product.name}*\n` +
      `• Size: *${selectedSize}*\n` +
      `• Quantity: *${quantity}*\n` +
      `• Price: *${formatPrice(product.price * quantity)}*\n` +
      (product.sku ? `• SKU: ${product.sku}\n` : '') +
      `\nPlease share availability and payment details.`
  );

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${orderMessage}`;

  return (
    <div className="w-full">
      {/* Breadcrumbs */}
      <nav
        className="mb-4 sm:mb-6 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none text-[11px] sm:text-xs text-[#8C7B6B] py-0.5"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-[#7B5B3A] transition-colors">
          Home
        </Link>
        <span className="text-[#C4B5A5]">/</span>
        {product.category && (
          <>
            <Link
              href={`/category/${product.category.slug}`}
              className="hover:text-[#7B5B3A] transition-colors"
            >
              {product.category.name}
            </Link>
            <span className="text-[#C4B5A5]">/</span>
          </>
        )}
        <span className="text-[#2C1D13] font-medium truncate max-w-[220px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Grid: Gallery & Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 xl:gap-16 items-start">
        {/* Left Column: Gallery */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:sticky lg:top-28">
          {/* Main Showcase Image */}
          <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-[#F5EDE3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(44,29,19,0.06)] group">
            {activeImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={optimizeCloudinaryUrl(activeImage.secure_url, { width: 1000 })}
                alt={activeImage.alt_text || product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                width={activeImage.width || 800}
                height={activeImage.height || 1000}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#F0E4D8] to-[#FAF6F0]" />
            )}

            {/* Badges (Top Left) */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-col gap-1.5">
              {product.is_new_arrival && <Badge variant="new" />}
              {product.is_on_sale && <Badge variant="sale" />}
              {product.stock_quantity <= 0 && <Badge variant="out-of-stock" />}
            </div>

            {/* Floating Wishlist Button (Top Right) */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-10 h-10 rounded-full bg-white/85 backdrop-blur-md shadow-sm flex items-center justify-center hover:bg-white transition-all">
              <WishlistButton productId={product.id} />
            </div>

            {/* Touch Previous / Next Buttons */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md shadow-sm flex items-center justify-center text-[#2C1D13] hover:bg-white active:scale-90 transition-all opacity-80 hover:opacity-100"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md shadow-sm flex items-center justify-center text-[#2C1D13] hover:bg-white active:scale-90 transition-all opacity-80 hover:opacity-100"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}

            {/* Image Counter Badge (Bottom Right) */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-medium tracking-wider pointer-events-none">
                {activeImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnails Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto py-1 scrollbar-none -mx-1 px-1">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 border-2 ${
                    idx === activeImageIndex
                      ? 'border-[#7B5B3A] shadow-sm ring-2 ring-[#7B5B3A]/25 scale-100'
                      : 'border-transparent opacity-65 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={optimizeCloudinaryUrl(img.secure_url, { width: 160 })}
                    alt={img.alt_text || `${product.name} preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="flex flex-col">
          {/* Category Eyebrow */}
          {product.category && (
            <p className="text-[11px] font-bold tracking-[0.22em] text-[#7B5B3A] uppercase mb-1.5">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <h1 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#2C1D13] leading-[1.14] mb-3">
            {product.name}
          </h1>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-1 flex-wrap">
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#2C1D13]">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base sm:text-lg text-[#8C7B6B] line-through font-normal">
                  {formatPrice(product.compare_at_price!)}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#8B4E5A] text-white">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] text-[#8C7B6B] mb-5">Taxes included. Worldwide dispatch.</p>

          {/* Short Tagline */}
          {product.short_description && (
            <p className="text-xs sm:text-sm text-[#6B5744] leading-relaxed mb-6 pb-5 border-b border-[#E2D5C7]">
              {product.short_description}
            </p>
          )}

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs sm:text-sm font-medium text-[#3D2B1F]">
                  Select Size: <strong className="font-bold text-[#2C1D13]">{selectedSize}</strong>
                </label>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {availableSizes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSize(s.name)}
                    className={`min-w-[48px] h-10 sm:h-11 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                      selectedSize === s.name
                        ? 'bg-[#2C1D13] text-white border-[#2C1D13] shadow-sm'
                        : 'bg-white text-[#3D2B1F] border-[#E2D5C7] hover:border-[#7B5B3A] active:scale-95'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-xs sm:text-sm font-medium text-[#3D2B1F] mb-2.5">
              Quantity:
            </label>
            <div className="inline-flex items-center border border-[#E2D5C7] rounded-full bg-white overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-10 h-10 flex items-center justify-center text-lg text-[#3D2B1F] hover:bg-[#FAF6F0] active:scale-90 transition-all"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-bold text-[#2C1D13]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="w-10 h-10 flex items-center justify-center text-lg text-[#3D2B1F] hover:bg-[#FAF6F0] active:scale-90 transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex items-center gap-3 mb-8">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2.5 rounded-full bg-[#128C7E] hover:bg-[#0E7064] text-white py-3.5 sm:py-4 px-6 text-xs sm:text-sm font-bold tracking-[0.14em] uppercase shadow-[0_4px_18px_rgba(18,140,126,0.3)] hover:shadow-[0_6px_22px_rgba(18,140,126,0.4)] active:scale-[0.99] transition-all"
            >
              <IconWhatsapp size={20} className="flex-shrink-0" />
              <span>Order via WhatsApp</span>
              <IconArrowRight size={16} className="opacity-80" />
            </a>

            <div className="w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 rounded-full border border-[#E2D5C7] bg-white flex items-center justify-center hover:border-[#7B5B3A] transition-colors shadow-xs">
              <WishlistButton productId={product.id} />
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="bg-[#FAF6F0] border border-[#E2D5C7]/80 rounded-2xl p-4 sm:p-5 space-y-3 mb-8">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-[#6B5744]">
              <IconTruck size={18} className="text-[#7B5B3A] flex-shrink-0" />
              <span>Complimentary shipping on orders over ₹2,999</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-[#6B5744]">
              <IconShield size={18} className="text-[#7B5B3A] flex-shrink-0" />
              <span>100% Genuine Designer Modest Craftsmanship</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-[#6B5744]">
              <IconPackage size={18} className="text-[#7B5B3A] flex-shrink-0" />
              <span>Delivered in signature luxury ZARISH packaging</span>
            </div>
          </div>

          {/* Information Tabs */}
          <div className="border-t border-[#E2D5C7] pt-6">
            <div className="flex border-b border-[#E2D5C7] gap-5 sm:gap-8 overflow-x-auto whitespace-nowrap scrollbar-none">
              <button
                type="button"
                className={`pb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'details'
                    ? 'border-[#2C1D13] text-[#2C1D13]'
                    : 'border-transparent text-[#8C7B6B] hover:text-[#2C1D13]'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Garment Story
              </button>
              {product.materials && (
                <button
                  type="button"
                  className={`pb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all border-b-2 ${
                    activeTab === 'materials'
                      ? 'border-[#2C1D13] text-[#2C1D13]'
                      : 'border-transparent text-[#8C7B6B] hover:text-[#2C1D13]'
                  }`}
                  onClick={() => setActiveTab('materials')}
                >
                  Fabric & Care
                </button>
              )}
              <button
                type="button"
                className={`pb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'shipping'
                    ? 'border-[#2C1D13] text-[#2C1D13]'
                    : 'border-transparent text-[#8C7B6B] hover:text-[#2C1D13]'
                }`}
                onClick={() => setActiveTab('shipping')}
              >
                Delivery & Returns
              </button>
            </div>

            <div className="pt-4 text-xs sm:text-sm text-[#6B5744] leading-relaxed">
              {activeTab === 'details' && (
                <p>{product.description || 'Crafted with timeless modesty and graceful silhouettes.'}</p>
              )}
              {activeTab === 'materials' && (
                <div className="space-y-1.5">
                  {product.materials && (
                    <p>
                      <strong>Fabric:</strong> {product.materials}
                    </p>
                  )}
                  {product.care_instructions && (
                    <p>
                      <strong>Care:</strong> {product.care_instructions}
                    </p>
                  )}
                </div>
              )}
              {activeTab === 'shipping' && (
                <div className="space-y-1.5">
                  <p>All pieces are carefully packed and dispatched within 24–48 business hours.</p>
                  <p>Express courier delivery takes 3–5 working days across India, and 5–8 days internationally.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Order Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E2D5C7] px-4 py-3 shadow-[0_-8px_30px_rgba(44,29,19,0.12)] flex items-center justify-between gap-3 md:hidden">
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] text-[#8C7B6B] truncate font-medium">
            {selectedSize ? `Size: ${selectedSize}` : product.name}
          </span>
          <span className="text-base font-bold text-[#2C1D13] leading-tight">
            {formatPrice(product.price * quantity)}
          </span>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 max-w-[210px] flex items-center justify-center gap-2 rounded-full bg-[#128C7E] hover:bg-[#0E7064] text-white py-3 px-4 text-xs font-bold tracking-wider uppercase shadow-md active:scale-95 transition-all"
        >
          <IconWhatsapp size={16} />
          <span>Order via WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
