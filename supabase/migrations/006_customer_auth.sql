-- =====================================================
-- Migration 006: Customer Authentication
-- Adds a customers table for storefront users,
-- links orders to registered customers,
-- and sets up RLS policies.
-- =====================================================

-- =====================================================
-- 1. CUSTOMERS TABLE (linked to auth.users)
-- =====================================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  default_address TEXT,
  default_city TEXT,
  default_state TEXT DEFAULT 'Tamil Nadu',
  default_pincode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_email ON public.customers(email);

-- =====================================================
-- 2. LINK ORDERS TO CUSTOMERS
-- =====================================================
ALTER TABLE public.orders
ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);

-- =====================================================
-- 3. RLS FOR CUSTOMERS TABLE
-- =====================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Customers can view their own profile
CREATE POLICY "Customers can view own profile"
  ON public.customers FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- Customers can update their own profile
CREATE POLICY "Customers can update own profile"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- Customers can insert their own profile (during registration)
CREATE POLICY "Customers can insert own profile"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

-- Admins can view all customers
CREATE POLICY "Admins can view all customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can manage all customers
CREATE POLICY "Admins can manage all customers"
  ON public.customers FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- 4. ALLOW CUSTOMERS TO VIEW THEIR OWN ORDERS
-- =====================================================
CREATE POLICY "Customers can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (customer_id = (SELECT auth.uid()));

CREATE POLICY "Customers can view own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE customer_id = (SELECT auth.uid())
    )
  );
