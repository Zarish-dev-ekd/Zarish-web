-- ============================================================
-- ZARISH — Product Badges & Ribbons SQL Migration
-- Run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Click Run
-- ============================================================

-- 1. Create product_badges table
CREATE TABLE IF NOT EXISTS public.product_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT 'corner_ribbon', -- 'corner_ribbon', 'hanging_flag', 'rosette', 'side_tag', 'luxury_pill'
  bg_color TEXT NOT NULL DEFAULT '#D4AF37',
  text_color TEXT NOT NULL DEFAULT '#FFFFFF',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_product_badges_display_order ON public.product_badges(display_order);

-- 2. Row Level Security
ALTER TABLE public.product_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read badges" ON public.product_badges;
DROP POLICY IF EXISTS "Admin manage badges" ON public.product_badges;

CREATE POLICY "Public read badges" ON public.product_badges 
  FOR SELECT USING (true);

CREATE POLICY "Admin manage badges" ON public.product_badges 
  FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'email') = 'zarish2025co@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'zarish2025co@gmail.com');

-- 3. Add badge_id foreign key column to products
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS badge_id UUID REFERENCES public.product_badges(id) ON DELETE SET NULL;

-- 4. Seed initial luxury badges
INSERT INTO public.product_badges (name, text, style, bg_color, text_color, display_order)
VALUES
  ('Bestseller (Gold Ribbon)', 'BESTSELLER', 'corner_ribbon', '#D4AF37', '#FFFFFF', 1),
  ('New Arrival (Emerald Ribbon)', 'NEW', 'corner_ribbon', '#0E7064', '#FFFFFF', 2),
  ('50% OFF (Hanging Flag)', '50% OFF', 'hanging_flag', '#C44D4D', '#FFFFFF', 3),
  ('Special Offer (Gold Rosette)', 'SPECIAL OFFER', 'rosette', '#E5A93C', '#2C241E', 4),
  ('Trending Now (Side Tag)', 'TRENDING', 'side_tag', '#7B5B3A', '#FFFFFF', 5),
  ('Limited Edition (Luxury Pill)', 'LIMITED EDITION', 'luxury_pill', '#2C241E', '#F8F5F0', 6)
ON CONFLICT DO NOTHING;
