-- =====================================================
-- Fix HIGH-2: Remove plaintext token storage from admin_otps
-- Tokens will be re-derived after OTP verification instead
-- =====================================================

ALTER TABLE public.admin_otps
  DROP COLUMN IF EXISTS access_token,
  DROP COLUMN IF EXISTS refresh_token;
