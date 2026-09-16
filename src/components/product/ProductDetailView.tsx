'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { formatPrice, getDiscountPercent, optimizeCloudinaryUrl } from '@/lib/utils';
import { IconArrowRight, IconTruck, IconShield, IconPackage, IconWhatsapp, IconShoppingBag } from '@/components/icons';
import Badge from './Badge';
import WishlistButton from './WishlistButton';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import { useCart } from '@/context/CartContext';
import type { Product, SiteSettings, ProductColor } from '@/lib/types';

interface ProductDetailViewProps {
  product: Product;
  settings: SiteSettings | null;
  colors?: ProductColor[];
}

export default function ProductDetailView({ product, settings, colors = [] }: ProductDetailViewProps) {
  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // 1. Detect colors available for this product (from variants and image alt tags)
  const productColors = useMemo(() => {
    const colorNamesSet = new Set<string>();

    // From variants
    product.variants?.forEach((v) => {
      if (v.is_active && v.color) {
        colorNamesSet.add(v.color.trim());
      }
    });

    // From images: direct color field OR [Color: name] pattern in alt_text
    product.images?.forEach((img) => {
      if (img.color) {
        colorNamesSet.add(img.color.trim());
      } else {
        const match = img.alt_text?.match(/\[Color:\s*([^\]]+)\]/i);
        if (match) {
          colorNamesSet.add(match[1].trim());
        }
      }
    });

    const list = Array.from(colorNamesSet);
    if (list.length === 0) return [];

    return list.map((cName) => {
      const matched = colors?.find(
        (c) => c.name.toLowerCase() === cName.toLowerCase()
      );
      return {
        name: cName,
        hex_code: matched?.hex_code || '#8C7B6B',
      };
    });
  }, [product.variants, product.images, colors]);

  // Selected Color state: initialized to card cover color or first color
  const [selectedColor, setSelectedColor] = useState<string | null>(() => {
    if (productColors.length === 0) return null;
    const primaryImg = product.images?.find((img) => img.role === 'primary');
    if (primaryImg?.alt_text) {
      const match = primaryImg.alt_text.match(/\[Color:\s*([^\]]+)\]/i);
      if (match) {
        const found = productColors.find(
          (c) => c.name.toLowerCase() === match[1].trim().toLowerCase()
        );
        if (found) return found.name;
      }
    }
    return productColors[0].name;
  });

  // Filter gallery images by selected color
  const displayedImages = useMemo(() => {
    if (!selectedColor || productColors.length === 0) {
      return product.images && product.images.length > 0 ? product.images : [];
    }

    const filtered = (product.images || []).filter((img) => {
      // Check direct color field first
      if (img.color) {
        return img.color.trim().toLowerCase() === selectedColor.toLowerCase();
      }
      // Fallback: check [Color: name] pattern in alt_text
      const match = img.alt_text?.match(/\[Color:\s*([^\]]+)\]/i);
      if (match) {
        return match[1].trim().toLowerCase() === selectedColor.toLowerCase();
      }
      return false;
    });

    if (filtered.length === 0) {
      return product.images && product.images.length > 0 ? product.images : [];
    }
    return filtered;
  }, [product.images, selectedColor, productColors]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // When color changes, reset active image index
  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    setActiveImageIndex(0);
  };

  // Filter sizes based on selected color (or standard sizes if no colors)
  const availableSizes = useMemo(() => {
    let variants = product.variants?.filter((v) => v.is_active && v.size) || [];

    if (selectedColor && productColors.length > 0) {
      const colorVariants = variants.filter(
        (v) => v.color?.toLowerCase() === selectedColor.toLowerCase()
      );
      if (colorVariants.length > 0) {
        variants = colorVariants;
      }
    }

    const sizeMap = new Map<string, { id: string; name: string; stock: number; inStock: boolean }>();
    variants.forEach((v) => {
      if (v.size && !sizeMap.has(v.size.name)) {
        sizeMap.set(v.size.name, {
          id: v.size.id,
          name: v.size.name,
          stock: v.stock_quantity ?? 0,
          inStock: (v.stock_quantity ?? 0) > 0,
        });
      }
    });

    return Array.from(sizeMap.values());
  }, [product.variants, selectedColor, productColors]);

  const [selectedSize, setSelectedSize] = useState<string>(
    availableSizes.length > 0 ? availableSizes[0].name : 'Standard'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'shipping'>('details');

  // Keep selectedSize synchronized when color/availableSizes change
  useEffect(() => {
    if (availableSizes.length > 0) {
      const exists = availableSizes.some((s) => s.name === selectedSize);
      if (!exists) {
        const firstInStock = availableSizes.find((s) => s.inStock);
        setSelectedSize(firstInStock ? firstInStock.name : availableSizes[0].name);
      }
    }
  }, [availableSizes, selectedSize]);

  const images = displayedImages;
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
    (selectedColor ? `• Color: *${selectedColor}*\n` : '') +
    `• Size: *${selectedSize}*\n` +
    `• Quantity: *${quantity}*\n` +
    `• Price: *${formatPrice(product.price * quantity)}*\n` +
    (product.sku ? `• SKU: ${product.sku}\n` : '') +
    `\nPlease share availability and payment details.`
  );

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${orderMessage}`;

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    const primaryImg =
      images.find((img) => img.role === 'primary')?.secure_url ||
      images[0]?.secure_url ||
      product.images?.[0]?.secure_url ||
      null;

    addToCart(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compare_at_price: product.compare_at_price,
        image_url: primaryImg,
        color: selectedColor,
        size: selectedSize || null,
        quantity,
      },
      true
    );
  };

  return (
    <div className="w-full pb-20 lg:pb-0">
      {/* Main Grid: Equal width 50/50 split between product image and right side content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-14 items-start">
        {/* Left Column: Gallery (sticky on desktop, same width as right content) */}
        <div className="w-full flex flex-col gap-3 sm:gap-4 static lg:sticky lg:top-28 z-0">
          {/* Main Showcase Image */}
          <div className="relative aspect-[4/5] max-h-[520px] w-full bg-[#F5EDE3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(44,29,19,0.06)] group">
            {activeImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={optimizeCloudinaryUrl(activeImage.secure_url, { width: 900 })}
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
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md shadow-sm flex items-center justify-center hover:bg-white transition-all">
              <WishlistButton product={product} />
            </div>

            {/* Touch Previous / Next Buttons */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md shadow-sm flex items-center justify-center text-[#2C1D13] hover:bg-white active:scale-90 transition-all opacity-80 hover:opacity-100 cursor-pointer"
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md shadow-sm flex items-center justify-center text-[#2C1D13] hover:bg-white active:scale-90 transition-all opacity-80 hover:opacity-100 cursor-pointer"
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
            <div className="flex gap-2 sm:gap-2.5 overflow-x-auto py-1 scrollbar-none -mx-1 px-1">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-14 h-18 sm:w-16 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 border-2 cursor-pointer ${
                    idx === activeImageIndex
                      ? 'border-[#7B5B3A] shadow-sm ring-2 ring-[#7B5B3A]/25 scale-100'
                      : 'border-transparent opacity-65 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={optimizeCloudinaryUrl(img.secure_url, { width: 140 })}
                    alt={img.alt_text || `${product.name} preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions (Equal 50% width) */}
        <div className="w-full flex flex-col">
          {/* Category Eyebrow */}
          {product.category && (
            <p className="text-[11px] font-bold tracking-[0.22em] text-[#7B5B3A] uppercase mb-1.5">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-serif text-[#2C1D13] mb-2 leading-tight">
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
            <p className="text-xs sm:text-sm text-[#6B5744] leading-relaxed mb-5 pb-4 border-b border-[#E2D5C7]">
              {product.short_description}
            </p>
          )}

          {/* Color Selector (Rendered when product has colors) */}
          {productColors.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-medium text-[#3D2B1F]">
                  Select Color: <strong className="font-bold text-[#2C1D13] capitalize">{selectedColor}</strong>
                </label>
                <span className="text-[11px] text-[#8C7B6B]">
                  {productColors.length} {productColors.length === 1 ? 'color' : 'colors'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {productColors.map((clr) => {
                  const isSelected = selectedColor?.toLowerCase() === clr.name.toLowerCase();
                  return (
                    <button
                      key={clr.name}
                      type="button"
                      onClick={() => handleSelectColor(clr.name)}
                      className={`group flex items-center gap-2 h-9 px-3 rounded-full border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-[#2C1D13] bg-[#FAF6F0] ring-2 ring-[#2C1D13]/20 shadow-xs'
                          : 'border-[#E2D5C7] bg-white hover:border-[#7B5B3A]'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/15 shadow-inner shrink-0"
                        style={{ backgroundColor: clr.hex_code }}
                      />
                      <span
                        className={`text-xs capitalize ${
                          isSelected ? 'font-bold text-[#2C1D13]' : 'font-medium text-[#6B5744]'
                        }`}
                      >
                        {clr.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-medium text-[#3D2B1F]">
                  Select Size: <strong className="font-bold text-[#2C1D13]">{selectedSize}</strong>
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSize(s.name)}
                    className={`min-w-[44px] h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
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
            <label className="block text-xs sm:text-sm font-medium text-[#3D2B1F] mb-2">
              Quantity:
            </label>
            <div className="inline-flex items-center border border-[#E2D5C7] rounded-full bg-white overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-9 h-9 flex items-center justify-center text-base text-[#3D2B1F] hover:bg-[#FAF6F0] active:scale-90 transition-all cursor-pointer"
              >
                −
              </button>
              <span className="w-9 text-center text-sm font-bold text-[#2C1D13]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="w-9 h-9 flex items-center justify-center text-base text-[#3D2B1F] hover:bg-[#FAF6F0] active:scale-90 transition-all cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Main Action Buttons (Properly aligned with equal widths and balanced heights) */}
          <div className="flex flex-col gap-3 mb-8">
            {/* Primary Row: Add to Bag + Instant Checkout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-[#2C1D13] bg-transparent hover:bg-[#2C1D13] text-[#2C1D13] hover:text-white px-5 text-xs sm:text-sm font-bold tracking-[0.14em] uppercase transition-all duration-200 shadow-xs cursor-pointer active:scale-[0.99]"
              >
                <IconShoppingBag size={17} />
                <span>Add to Bag</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="h-12 flex items-center justify-center gap-2 rounded-xl bg-[#2C1D13] hover:bg-[#7B5B3A] text-white px-5 text-xs sm:text-sm font-bold tracking-[0.14em] uppercase shadow-[0_4px_16px_rgba(44,29,19,0.18)] hover:shadow-[0_6px_20px_rgba(123,91,58,0.25)] active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                <span>Instant Checkout</span>
                <IconArrowRight size={16} className="opacity-80" />
              </button>
            </div>

            {/* Secondary Row: Order on WhatsApp + Wishlist */}
            <div className="flex items-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-[#128C7E] hover:bg-[#0E7064] text-white px-5 text-xs sm:text-sm font-bold tracking-[0.12em] uppercase shadow-[0_4px_14px_rgba(18,140,126,0.2)] hover:shadow-[0_6px_18px_rgba(18,140,126,0.3)] active:scale-[0.99] transition-all duration-200 whitespace-nowrap"
              >
                <IconWhatsapp size={18} className="flex-shrink-0" />
                <span>Order on WhatsApp</span>
              </a>

              <div className="h-12 w-12 flex-shrink-0 rounded-xl border border-[#E2D5C7] bg-white flex items-center justify-center hover:border-[#7B5B3A] hover:bg-[#FAF6F0] transition-colors shadow-xs">
                <WishlistButton product={product} />
              </div>
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
                className={`pb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
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
                  className={`pb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
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
                className={`pb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
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
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#E2D5C7] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(44,29,19,0.12)] flex items-center justify-between gap-3 md:hidden">
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] text-[#8C7B6B] truncate font-medium">
            {selectedColor ? `${selectedColor} • ` : ''}{selectedSize ? `Size: ${selectedSize}` : product.name}
          </span>
          <span className="text-base font-bold text-[#2C1D13] leading-tight">
            {formatPrice(product.price * quantity)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1 rounded-full border border-[#2C1D13] bg-white text-[#2C1D13] hover:bg-[#FAF6F0] py-2.5 px-3 text-xs font-bold tracking-wider uppercase active:scale-95 transition-all cursor-pointer"
            aria-label="Add to Bag"
          >
            <IconShoppingBag size={14} />
            <span>Bag</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            className="flex items-center justify-center rounded-full bg-[#2C1D13] hover:bg-[#7B5B3A] text-white py-2.5 px-3.5 text-xs font-bold tracking-wider uppercase shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span>Buy Now</span>
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 rounded-full bg-[#128C7E] hover:bg-[#0E7064] text-white py-2.5 px-3 text-xs font-bold tracking-wider uppercase shadow-md active:scale-95 transition-all"
            aria-label="Order on WhatsApp"
          >
            <IconWhatsapp size={15} />
            <span>WA</span>
          </a>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        quantity={quantity}
      />
    </div>
  );
}
