-- ==============================================================================
-- Migration: 20261009_admin_orders_and_shipping_labels.sql
-- Description: 
--   1. Creates store_policies table if not exists (for shipping settings, policies, size guide).
--   2. Adds tracking_url column to orders table for live courier tracking links.
--   3. Seeds default Shipping Sender (FROM) address in store_policies.
-- ==============================================================================

-- 1. Create store_policies table if it does not exist
CREATE TABLE IF NOT EXISTS public.store_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on store_policies
ALTER TABLE public.store_policies ENABLE ROW LEVEL SECURITY;

-- Allow public read access to store_policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'store_policies' AND policyname = 'Allow public read access to store_policies'
  ) THEN
    CREATE POLICY "Allow public read access to store_policies"
    ON public.store_policies FOR SELECT
    USING (true);
  END IF;
END $$;

-- Allow full access to service_role / authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'store_policies' AND policyname = 'Allow all access to store_policies'
  ) THEN
    CREATE POLICY "Allow all access to store_policies"
    ON public.store_policies FOR ALL
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- 2. Add tracking_url column to orders table
ALTER TABLE IF EXISTS public.orders 
ADD COLUMN IF NOT EXISTS tracking_url TEXT;

COMMENT ON COLUMN public.orders.tracking_url IS 'External courier live tracking URL link provided by store admin';

-- 3. Seed initial Shipping Sender (FROM Address) in store_policies
INSERT INTO public.store_policies (slug, title, content, updated_at)
VALUES (
  'shipping-sender-settings',
  'Shipping Label Sender Address and Account Information',
  '{
    "storeName": "ZARISH",
    "address": "Convent Junction, EKM, 682011",
    "customerId": "1511058312",
    "accountInfo": "NHS KOCHI - BNPL A/C 158",
    "phone": "9562292980"
  }'::jsonb,
  NOW()
)
ON CONFLICT (slug) DO NOTHING;
