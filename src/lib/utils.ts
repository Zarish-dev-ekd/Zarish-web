/* ============================================================
   ZARISH — Utility Functions
   ============================================================ */

import { CURRENCY } from './constants';

/**
 * Merge CSS class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a price with currency symbol.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate discount percentage.
 */
export function getDiscountPercent(price: number, compareAt: number): number {
  if (compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/**
 * Generate a Cloudinary optimized URL with transformations.
 */
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | string;
    format?: string;
    crop?: string;
  } = {}
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'sjo0iipf';
  if (!cloudName) return '';

  const transforms: string[] = [];
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  transforms.push(`q_${options.quality || 'auto'}`);
  transforms.push(`f_${options.format || 'auto'}`); // Auto-converts PNG/JPG to WebP/AVIF!
  if (options.crop) transforms.push(`c_${options.crop}`);
  else if (options.width || options.height) transforms.push('c_fill');

  const transformation = transforms.join(',');
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
}

/**
 * Automatically injects WebP/AVIF automatic optimization (f_auto,q_auto)
 * into any existing Cloudinary URL.
 */
export function optimizeCloudinaryUrl(
  url: string | null | undefined,
  options: { width?: number; height?: number } = {}
): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;

  // Build transformation string
  const transforms = ['f_auto', 'q_auto'];
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  const transformStr = transforms.join(',');

  // If already has transformation, avoid duplicate
  if (url.includes('/f_auto')) return url;

  // Insert f_auto,q_auto after /image/upload/
  return url.replace('/image/upload/', `/image/upload/${transformStr}/`);
}

/**
 * Generate a slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text to a maximum length.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}
