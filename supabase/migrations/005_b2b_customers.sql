-- =====================================================
-- R Creation Enterprise E-Commerce Database Schema
-- Migration 005: B2B Customers and Role updates
-- =====================================================

-- 1. Update Profiles Role Constraint
-- We need to drop the old constraint and add a new one that allows 'b2b_partner' and 'customer'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'staff', 'b2b_partner', 'customer'));

-- 2. Create B2B Customers Table
CREATE TABLE public.b2b_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  gstin TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  billing_address TEXT NOT NULL,
  shipping_address TEXT,
  discount_tier TEXT NOT NULL DEFAULT 'bronze' CHECK (discount_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_b2b_status ON public.b2b_customers(status);
CREATE INDEX idx_b2b_profile ON public.b2b_customers(profile_id);

CREATE TRIGGER update_b2b_customers_updated_at 
  BEFORE UPDATE ON public.b2b_customers 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
