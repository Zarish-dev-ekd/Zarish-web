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

-- 4. Seed initial corner ribbon badges
INSERT INTO public.product_badges (name, text, style, bg_color, text_color, display_order)
VALUES
  ('NEW (Yellow Corner Ribbon)', 'NEW', 'corner_ribbon', '#FFD200', '#000000', 1),
  ('BEST (Yellow Corner Ribbon)', 'BEST', 'corner_ribbon', '#FFD200', '#000000', 2),
  ('SALE (Yellow Corner Ribbon)', 'SALE', 'corner_ribbon', '#FFD200', '#000000', 3),
  ('BESTSELLER (Gold Corner Ribbon)', 'BESTSELLER', 'corner_ribbon', '#D4AF37', '#FFFFFF', 4),
  ('50% OFF (Yellow Corner Ribbon)', '50% OFF', 'corner_ribbon', '#FFD200', '#000000', 5),
  ('NEW ARRIVAL (Emerald Ribbon)', 'NEW', 'corner_ribbon', '#0E7064', '#FFFFFF', 6),
  ('SPECIAL OFFER (Red Ribbon)', 'SPECIAL', 'corner_ribbon', '#C44D4D', '#FFFFFF', 7)
ON CONFLICT DO NOTHING;
