-- ==============================================================================
-- Migration: Global Stock & Urgency Badge Settings
-- Description: Adds configuration toggles and thresholds to site_settings
-- Date: 2026-10-07
-- ==============================================================================

-- 1. Add low stock badge columns to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS enable_low_stock_badge BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS show_in_stock_badge BOOLEAN DEFAULT FALSE;

-- 2. Update existing default row if present or insert default
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.site_settings LIMIT 1) THEN
    UPDATE public.site_settings
    SET 
      enable_low_stock_badge = COALESCE(enable_low_stock_badge, TRUE),
      low_stock_threshold = COALESCE(low_stock_threshold, 3),
      show_in_stock_badge = COALESCE(show_in_stock_badge, FALSE);
  ELSE
    INSERT INTO public.site_settings (
      id,
      site_name,
      enable_low_stock_badge,
      low_stock_threshold,
      show_in_stock_badge
    ) VALUES (
      'default_settings',
      'ZARISH',
      TRUE,
      3,
      FALSE
    );
  END IF;
END $$;

COMMENT ON COLUMN public.site_settings.enable_low_stock_badge IS 'Master toggle to show or hide "Only X Left" urgency badges globally';
COMMENT ON COLUMN public.site_settings.low_stock_threshold IS 'Stock threshold (inclusive) at or below which the low stock urgency badge is shown';
COMMENT ON COLUMN public.site_settings.show_in_stock_badge IS 'Toggle to display generic "In Stock" tags (disabled by default for clean boutique UI)';
