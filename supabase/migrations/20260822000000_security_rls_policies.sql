-- =====================================================
-- R Creation Enterprise E-Commerce Database Schema
-- Migration: Security Hardening - RLS Policies for idempotency_keys and b2b_customers
-- =====================================================

-- =====================================================
-- 1. idempotency_keys: Add RLS + policy (defense-in-depth)
-- Table created in migration 010, accessed via SECURITY DEFINER RPC
-- =====================================================

-- Enable RLS (already enabled by default on table creation, but explicit)
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access (defense-in-depth; currently only RPC with service role accesses)
CREATE POLICY "Service role can manage idempotency keys" 
  ON public.idempotency_keys 
  FOR ALL 
  TO service_role 
  USING (true)
  WITH CHECK (true);

-- Optional: Customer can view their own idempotency keys via order ownership
-- (defense-in-depth; not currently needed since only RPC accesses)
CREATE POLICY "Customers can view own idempotency keys" 
  ON public.idempotency_keys 
  FOR SELECT 
  TO authenticated 
  USING (
    order_id IN (
      SELECT id FROM public.orders 
      WHERE customer_id = auth.uid()
    )
  );

-- =====================================================
-- 2. b2b_customers: Add RLS + policies (migration 005 missing policies)
-- Table has profile_id FK to profiles; access controlled by admin role + profile ownership
-- =====================================================

-- Enable RLS (already enabled by default on table creation, but explicit)
ALTER TABLE public.b2b_customers ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage all B2B customers
CREATE POLICY "Admins can manage all B2B customers" 
  ON public.b2b_customers 
  FOR ALL 
  TO authenticated 
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: B2B partner can view/update their own B2B customer record
CREATE POLICY "B2B partners can view own record" 
  ON public.b2b_customers 
  FOR SELECT 
  TO authenticated 
  USING (profile_id = auth.uid());

CREATE POLICY "B2B partners can update own record" 
  ON public.b2b_customers 
  FOR UPDATE 
  TO authenticated 
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Note: B2B partners cannot INSERT their own record — that's done by admin approval
-- (status starts as 'pending', admin approves)

-- =====================================================
-- 3. Inquiries: No user SELECT policy (deliberate)
-- Anonymous submission allowed (free-text email). 
-- Adding email-based SELECT would be insecure (anyone can claim any email).
-- If user-facing inquiry history is needed, require account creation + signed token.
-- No migration needed — keeping admin-only SELECT as designed.
-- =====================================================

-- =====================================================
-- 4. rate_limits: Skip RLS
-- Table accessed only via SECURITY DEFINER RPC check_rate_limit
-- Function has REVOKE from PUBLIC, anon, authenticated
-- Service role executes with elevated privileges
-- No client-reachable query path exists
-- No migration needed
-- =====================================================