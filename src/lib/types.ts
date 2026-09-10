/* ============================================================
   ZARISH — TypeScript Type Definitions
   All interfaces for the data model, ready for Supabase.
   ============================================================ */

// ─── Site Settings ───────────────────────────────────────────
export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string;
  logo_url: string;
  logo_alt: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  social_instagram: string;
  social_facebook: string;
  social_whatsapp: string;
  social_youtube: string;
  currency_code: string;
  currency_symbol: string;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
  updated_at: string;
}

// ─── Announcements ──────────────────────────────────────────
export interface Announcement {
  id: string;
  text: string;
  icon: string;
  link_url: string | null;
  link_text: string | null;
  display_order: number;
  is_active: boolean;
  show_on_desktop: boolean;
  show_on_mobile: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Navigation ──────────────────────────────────────────────
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  display_order: number;
  is_active: boolean;
  parent_id: string | null;
  open_in_new_tab: boolean;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Hero Slides ─────────────────────────────────────────────
export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_url: string;
  image_url: string;
  image_alt: string;
  mobile_image_url: string | null;
  overlay_text: string | null;
  campaign_badge: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Benefits ────────────────────────────────────────────────
export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Categories ──────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string;
  image_alt: string;
  mobile_image_url: string | null;
  cta_label: string;
  display_order: number;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Sizes ───────────────────────────────────────────────────
export interface Size {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Products ────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  category_id: string | null;
  category: Category | null;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  materials: string | null;
  care_instructions: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  stock_quantity: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Product Images ──────────────────────────────────────────
export interface ProductImage {
  id: string;
  product_id: string;
  cloudinary_public_id: string;
  secure_url: string;
  alt_text: string;
  width: number;
  height: number;
  role: 'primary' | 'secondary' | 'gallery' | 'thumbnail';
  display_order: number;
  created_at: string;
}

// ─── Product Variants ────────────────────────────────────────
export interface ProductVariant {
  id: string;
  product_id: string;
  size_id: string;
  size: Size | null;
  color: string | null;
  sku: string | null;
  price: number | null;
  compare_at_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Collections ─────────────────────────────────────────────
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  display_order: number;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Blog Posts ──────────────────────────────────────────────
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  author: string;
  is_published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Brand Story ─────────────────────────────────────────────
export interface BrandStoryData {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image_url: string;
  image_alt: string;
  cta_text: string;
  cta_url: string;
  is_active: boolean;
  updated_at: string;
}

// ─── Newsletter Config ──────────────────────────────────────
export interface NewsletterConfig {
  id: string;
  heading: string;
  description: string;
  cta_text: string;
  is_active: boolean;
  updated_at: string;
}

// ─── Footer Links ────────────────────────────────────────────
export interface FooterGroup {
  id: string;
  title: string;
  display_order: number;
  is_active: boolean;
  links: FooterLink[];
}

export interface FooterLink {
  id: string;
  group_id: string;
  label: string;
  href: string;
  display_order: number;
  is_active: boolean;
  open_in_new_tab: boolean;
}

// ─── Cart ────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant | null;
  size: Size | null;
  quantity: number;
  unit_price: number;
}

// ─── Wishlist ────────────────────────────────────────────────
export interface WishlistItem {
  id: string;
  product_id: string;
  product: Product;
  created_at: string;
}

// ─── Homepage Section Config ─────────────────────────────────
export interface HomepageSectionConfig {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_url: string | null;
  is_active: boolean;
  display_order: number;
  updated_at: string;
}

// ─── Media Asset ─────────────────────────────────────────────
export interface MediaAsset {
  id: string;
  provider: 'cloudinary';
  provider_public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  alt_text: string;
  folder: string;
  created_at: string;
}

// ─── Orders & Payments ───────────────────────────────────────
export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  size?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address: ShippingAddress;
  total_amount: number;
  currency: string;
  payment_method: 'razorpay' | 'cod' | 'whatsapp';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  order_status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}
