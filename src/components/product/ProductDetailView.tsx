'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice, getDiscountPercent, optimizeCloudinaryUrl } from '@/lib/utils';
import { IconArrowRight, IconHeart, IconTruck, IconShield, IconPackage } from '@/components/icons';
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
  const availableSizes = product.variants
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
    <div className="product-detail">
      {/* Breadcrumbs */}
      <nav className="product-breadcrumbs" aria-label="Breadcrumb">
        <ol className="product-breadcrumbs__list">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>/</li>
          {product.category && (
            <>
              <li>
                <Link href={`/category/${product.category.slug}`}>{product.category.name}</Link>
              </li>
              <li>/</li>
            </>
          )}
          <li aria-current="page" className="product-breadcrumbs__current">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="product-detail__grid">
        {/* Left Column: Gallery */}
        <div className="product-detail__gallery">
          <div className="product-detail__main-image-wrapper">
            {activeImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={optimizeCloudinaryUrl(activeImage.secure_url, { width: 1000 })}
                alt={activeImage.alt_text || product.name}
                className="product-detail__main-image"
                width={activeImage.width || 800}
                height={activeImage.height || 1000}
              />
            ) : (
              <div className="product-detail__image-placeholder" />
            )}

            {/* Badges */}
            <div className="product-detail__badges">
              {product.is_new_arrival && <Badge variant="new" />}
              {product.is_on_sale && <Badge variant="sale" />}
              {product.stock_quantity <= 0 && <Badge variant="out-of-stock" />}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="product-detail__thumbnails">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`product-detail__thumbnail-btn ${
                    idx === activeImageIndex ? 'product-detail__thumbnail-btn--active' : ''
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={optimizeCloudinaryUrl(img.secure_url, { width: 160 })}
                    alt={img.alt_text || `${product.name} preview ${idx + 1}`}
                    className="product-detail__thumbnail-img"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Information & Purchase Actions */}
        <div className="product-detail__info">
          {product.category && (
            <p className="product-detail__category">{product.category.name.toUpperCase()}</p>
          )}

          <h1 className="product-detail__title">{product.name}</h1>

          {/* Pricing */}
          <div className="product-detail__pricing">
            <span className="product-detail__price">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="product-detail__compare-price">
                  {formatPrice(product.compare_at_price!)}
                </span>
                <span className="product-detail__discount-tag">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>
          <p className="product-detail__tax-note">Taxes included. Worldwide dispatch.</p>

          {/* Short Tagline */}
          {product.short_description && (
            <p className="product-detail__short-desc">{product.short_description}</p>
          )}

          <hr className="product-detail__divider" />

          {/* Sizing Selector */}
          {availableSizes.length > 0 && (
            <div className="product-detail__sizes-block">
              <div className="product-detail__size-header">
                <label className="product-detail__label">
                  Select Size: <strong>{selectedSize}</strong>
                </label>
              </div>
              <div className="product-detail__size-pills">
                {availableSizes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSize(s.name)}
                    className={`product-detail__size-pill ${
                      selectedSize === s.name ? 'product-detail__size-pill--selected' : ''
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="product-detail__qty-block">
            <label className="product-detail__label">Quantity:</label>
            <div className="product-detail__qty-control">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="product-detail__actions">
            {/* Direct WhatsApp Ordering */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary btn--lg product-detail__whatsapp-btn"
            >
              Order via WhatsApp <IconArrowRight size={16} />
            </a>

            {/* Add to Wishlist */}
            <div className="product-detail__wishlist-btn-wrap">
              <WishlistButton productId={product.id} />
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="product-detail__guarantees">
            <div className="product-detail__guarantee-item">
              <IconTruck size={18} />
              <span>Complimentary shipping on orders over ₹2,999</span>
            </div>
            <div className="product-detail__guarantee-item">
              <IconShield size={18} />
              <span>100% Genuine Designer Modest Craftsmanship</span>
            </div>
            <div className="product-detail__guarantee-item">
              <IconPackage size={18} />
              <span>Delivered in signature luxury ZARISH packaging</span>
            </div>
          </div>

          {/* Information Tabs */}
          <div className="product-detail__tabs">
            <div className="product-detail__tab-nav">
              <button
                type="button"
                className={`product-detail__tab-btn ${activeTab === 'details' ? 'product-detail__tab-btn--active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Garment Story
              </button>
              {product.materials && (
                <button
                  type="button"
                  className={`product-detail__tab-btn ${activeTab === 'materials' ? 'product-detail__tab-btn--active' : ''}`}
                  onClick={() => setActiveTab('materials')}
                >
                  Fabric & Care
                </button>
              )}
              <button
                type="button"
                className={`product-detail__tab-btn ${activeTab === 'shipping' ? 'product-detail__tab-btn--active' : ''}`}
                onClick={() => setActiveTab('shipping')}
              >
                Delivery & Returns
              </button>
            </div>

            <div className="product-detail__tab-content">
              {activeTab === 'details' && (
                <div className="product-detail__description">
                  <p>{product.description || 'Crafted with timeless modesty and graceful silhouettes.'}</p>
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="product-detail__description">
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
                <div className="product-detail__description">
                  <p>All pieces are carefully packed and dispatched within 24–48 business hours.</p>
                  <p>Express courier delivery takes 3–5 working days across India, and 5–8 days internationally.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
