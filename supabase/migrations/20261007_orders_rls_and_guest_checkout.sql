-- ==============================================================================
-- Migration: 20261007_orders_rls_and_guest_checkout.sql
-- Description: Update RLS policies on `orders` and `order_items` tables to support:
--   1. Guest (unauthenticated) checkout order insertion via backend/fallback.
--   2. Customer account order retrieval matching both user_id and customer_email.
--   3. Unrestricted admin management for 'zarish2025co@gmail.com'.
-- Date: 2026-10-07
-- ==============================================================================

-- 1. Ensure RLS is enabled on orders and order_items
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing order policies to avoid conflicts
DROP POLICY IF EXISTS "Customers view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
DROP POLICY IF EXISTS "Allow order creation" ON public.orders;
DROP POLICY IF EXISTS "Public read own orders" ON public.orders;
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;

-- 3. ORDERS Policies
-- A. Customers can view their own orders (matched by auth user_id OR email for guest orders)
--    and Admin has full viewing access.
CREATE POLICY "Customers view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR lower(customer_email) = lower(auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') = 'zarish2025co@gmail.com'
  );

-- B. Admins have full access to manage/update/delete orders
CREATE POLICY "Admins manage orders" ON public.orders
  FOR ALL TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'zarish2025co@gmail.com'
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'zarish2025co@gmail.com'
  );

-- C. Allow order insertion (bypasses restriction when customer checks out)
CREATE POLICY "Allow order creation" ON public.orders
  FOR INSERT WITH CHECK (true);


-- 4. Drop existing order_items policies
DROP POLICY IF EXISTS "Customers view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow order items creation" ON public.order_items;
DROP POLICY IF EXISTS "Public read order items" ON public.order_items;
DROP POLICY IF EXISTS "Public insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admin manage order items" ON public.order_items;

-- 5. ORDER ITEMS Policies
-- A. Customers can view items belonging to their orders
CREATE POLICY "Customers view own order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (
        o.user_id = auth.uid()
        OR lower(o.customer_email) = lower(auth.jwt() ->> 'email')
        OR (auth.jwt() ->> 'email') = 'zarish2025co@gmail.com'
      )
    )
  );

-- B. Admins have full access to manage order items
CREATE POLICY "Admins manage order items" ON public.order_items
  FOR ALL TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'zarish2025co@gmail.com'
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'zarish2025co@gmail.com'
  );

-- C. Allow order items insertion
CREATE POLICY "Allow order items creation" ON public.order_items
  FOR INSERT WITH CHECK (true);
