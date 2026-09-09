/* ============================================================
   ZARISH — Design Constants & Configuration
   ============================================================ */

/** Breakpoints in pixels */
export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1440,
} as const;

/** Default pagination */
export const PAGINATION = {
  PRODUCTS_PER_PAGE: 12,
  HOMEPAGE_NEW_ARRIVALS: 4,
  HOMEPAGE_FEATURED: 8,
} as const;

/** Image size presets for Cloudinary transformations */
export const IMAGE_SIZES = {
  hero_desktop: { width: 1200, height: 800 },
  hero_mobile: { width: 600, height: 700 },
  category_card: { width: 400, height: 500 },
  product_card: { width: 400, height: 500 },
  product_detail: { width: 800, height: 1000 },
  thumbnail: { width: 100, height: 100 },
  logo: { width: 200, height: 60 },
} as const;

/** Currency formatting */
export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  locale: 'en-IN',
} as const;

/** Route paths */
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  COLLECTIONS: '/collections',
  CATEGORY: '/category',
  SHOP_BY_SIZE: '/shop-by-size',
  SEARCH: '/search',
  ABOUT: '/about',
  BLOG: '/blog',
  OFFERS: '/offers',
  CART: '/cart',
  ACCOUNT: '/account',
  ADMIN: '/admin',
} as const;
