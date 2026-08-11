-- =====================================================
-- Migration 004: Allow Guest Orders
-- =====================================================

-- 1. Make created_by nullable in the orders table to support guest checkouts
ALTER TABLE public.orders 
ALTER COLUMN created_by DROP NOT NULL;

-- 2. Add an is_guest boolean for easier filtering
ALTER TABLE public.orders 
ADD COLUMN is_guest BOOLEAN NOT NULL DEFAULT false;

-- 3. We also need an order_items table if it's missing, but it is actually defined in migration 001.
-- Just update policies if necessary.

-- (We are using a Service Role client for checkout, so we DO NOT need to open
-- the database to anonymous inserts. RLS remains fully enforced).
