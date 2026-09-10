-- ============================================================
-- ZARISH BY NEHALA MUFEED — Supabase Production Database Schema
-- Run this entire script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Click Run
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'ZARISH',
  tagline TEXT DEFAULT 'Beauty in Modesty',
  logo_url TEXT DEFAULT '/logo-zarish.png',
  logo_alt TEXT DEFAULT 'ZARISH by Nehala Mufeed',
  favicon_url TEXT DEFAULT '/favicon.ico',
  primary_color TEXT DEFAULT '#7B5B3A',
  secondary_color TEXT DEFAULT '#FAF6F0',
  contact_email TEXT DEFAULT 'contact@zarish.com',
  contact_phone TEXT DEFAULT '+91 98765 43210',
  address TEXT DEFAULT 'Kerala, India',
  social_instagram TEXT DEFAULT 'https://instagram.com',
  social_facebook TEXT DEFAULT 'https://facebook.com',
  social_whatsapp TEXT DEFAULT 'https://wa.me/919876543210',
  social_youtube TEXT DEFAULT '',
  currency_code TEXT DEFAULT 'INR',
  currency_symbol TEXT DEFAULT '₹',
  meta_title TEXT DEFAULT 'ZARISH by Nehala Mufeed | Premium Modest Fashion',
  meta_description TEXT DEFAULT 'Discover elegant modest fashion by ZARISH. Graceful pieces for your everyday elegance.',
  og_image_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  icon TEXT DEFAULT 'truck',
  link_url TEXT,
  link_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  show_on_desktop BOOLEAN DEFAULT true,
  show_on_mobile BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Navigation Items Table
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  open_in_new_tab BOOLEAN DEFAULT false,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Hero Slides Table
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow TEXT DEFAULT 'NEW ARRIVALS',
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT DEFAULT 'EXPLORE COLLECTION',
  cta_url TEXT DEFAULT '/collections',
  image_url TEXT NOT NULL,
  image_alt TEXT DEFAULT 'ZARISH Collection',
  mobile_image_url TEXT,
  overlay_text TEXT,
  campaign_badge TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Benefits Table
CREATE TABLE IF NOT EXISTS public.benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'truck',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  image_alt TEXT,
  mobile_image_url TEXT,
  cta_label TEXT DEFAULT 'EXPLORE',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 7. Sizes Table
CREATE TABLE IF NOT EXISTS public.sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 8. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10, 2),
  sku TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  materials TEXT,
  care_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT true,
  is_on_sale BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 9. Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  cloudinary_public_id TEXT NOT NULL,
  secure_url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  width INTEGER DEFAULT 800,
  height INTEGER DEFAULT 1000,
  role TEXT DEFAULT 'gallery',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 10. Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_id UUID REFERENCES public.sizes(id) ON DELETE SET NULL,
  color TEXT,
  sku TEXT,
  price NUMERIC(10, 2),
  compare_at_price NUMERIC(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 11. Subscribers Table (Newsletter)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Public READ policies (anyone can read active content for storefront)
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public read navigation_items" ON public.navigation_items FOR SELECT USING (true);
CREATE POLICY "Public read hero_slides" ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "Public read benefits" ON public.benefits FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read sizes" ON public.sizes FOR SELECT USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read product_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public read product_variants" ON public.product_variants FOR SELECT USING (true);

-- Public INSERT for newsletter subscriptions
CREATE POLICY "Public insert subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);

-- Allow full access for anon/authenticated in dev / admin management
-- (Note: In production with Supabase Auth, restrict this to auth.role() = 'authenticated')
CREATE POLICY "Admin all site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin all announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin all navigation_items" ON public.navigation_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin all hero_slides" ON public.hero_slides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin all benefits" ON public.benefits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin all categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin all sizes" ON public.sizes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin all products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin all product_images" ON public.product_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin all product_variants" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin all subscribers" ON public.subscribers FOR ALL USING (true) WITH CHECK (true);

-- Insert initial default site settings if none exist
INSERT INTO public.site_settings (site_name, tagline, meta_title, meta_description)
SELECT 'ZARISH', 'Beauty in Modesty', 'ZARISH by Nehala Mufeed | Premium Modest Fashion', 'Discover elegant modest fashion by ZARISH. Graceful pieces for your everyday elegance.'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- 12. Customer Orders Table (Razorpay & Storefront Orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT NOT NULL DEFAULT 'razorpay',
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed, refunded
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  order_status TEXT NOT NULL DEFAULT 'placed', -- placed, confirmed, processing, shipped, delivered, cancelled
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 13. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  size TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read own orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Public insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage order items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

