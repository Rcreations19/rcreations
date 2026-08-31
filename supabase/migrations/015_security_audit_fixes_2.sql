-- =====================================================
-- R Creation Enterprise E-Commerce Database Schema
-- Migration: Security Audit Fixes 2
-- =====================================================

-- 1. Fix Price Tampering Vulnerability in process_checkout RPC
-- Revoke PUBLIC execution to prevent attackers from directly creating arbitrary $0.01 custom orders.
-- This function must now ONLY be called from the server using the service_role key.
REVOKE EXECUTE ON FUNCTION public.process_checkout(UUID, JSONB, JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_checkout(UUID, JSONB, JSONB) FROM anon;
REVOKE EXECUTE ON FUNCTION public.process_checkout(UUID, JSONB, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_checkout(UUID, JSONB, JSONB) TO service_role;
