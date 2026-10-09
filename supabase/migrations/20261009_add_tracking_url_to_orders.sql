-- ==============================================================================
-- Migration: 20261009_add_tracking_url_to_orders.sql
-- Description: Add tracking_url column to orders table for direct shipment tracking links
-- ==============================================================================

ALTER TABLE IF EXISTS public.orders 
ADD COLUMN IF NOT EXISTS tracking_url TEXT;

COMMENT ON COLUMN public.orders.tracking_url IS 'External courier live tracking URL link provided by store admin';
