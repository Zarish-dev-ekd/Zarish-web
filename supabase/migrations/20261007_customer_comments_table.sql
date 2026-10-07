-- ==============================================================================
-- Migration: Create customer_comments table with email support
-- Description: Stores customer feedback messages with name, email, and message
-- Date: 2026-10-07
-- ==============================================================================

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.customer_comments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'approved',
  admin_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add email column if table already existed without it
ALTER TABLE public.customer_comments
ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.customer_comments ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Public insert comments" ON public.customer_comments;
DROP POLICY IF EXISTS "Admin view comments" ON public.customer_comments;

-- Allow public to submit comments
CREATE POLICY "Public insert comments" ON public.customer_comments
  FOR INSERT
  WITH CHECK (true);

-- Allow admins full access to view, update, and delete comments
CREATE POLICY "Admin view comments" ON public.customer_comments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.customer_comments IS 'Stores private customer feedback and founder notes submitted on the website';
COMMENT ON COLUMN public.customer_comments.email IS 'Optional customer email for follow-up responses from the store owner';
