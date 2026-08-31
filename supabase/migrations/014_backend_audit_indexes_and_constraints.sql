-- =====================================================
-- Migration 014: Backend Audit - Indexes & Constraints
-- =====================================================

-- 1. Create B-Tree indexes for heavily queried foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_by ON public.orders(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_b2b_customers_profile_id ON public.b2b_customers(profile_id);

-- 2. Add CHECK constraints to enforce valid status/role values

-- Orders
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS chk_orders_status;

ALTER TABLE public.orders 
ADD CONSTRAINT chk_orders_status CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Inquiries
ALTER TABLE public.inquiries 
DROP CONSTRAINT IF EXISTS chk_inquiries_status;

ALTER TABLE public.inquiries 
ADD CONSTRAINT chk_inquiries_status CHECK (status IN ('new', 'in_progress', 'resolved', 'spam'));

-- B2B Customers
ALTER TABLE public.b2b_customers 
DROP CONSTRAINT IF EXISTS chk_b2b_customers_status;

ALTER TABLE public.b2b_customers 
ADD CONSTRAINT chk_b2b_customers_status CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Profiles
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS chk_profiles_role;

UPDATE public.profiles SET role = 'customer' WHERE role IS NULL OR role NOT IN ('admin', 'customer', 'b2b_partner');

ALTER TABLE public.profiles 
ADD CONSTRAINT chk_profiles_role CHECK (role IN ('admin', 'customer', 'b2b_partner'));
