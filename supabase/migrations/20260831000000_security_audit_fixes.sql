-- =====================================================
-- Migration 20260831000000: Security Audit Fixes
-- Fixes HIGH-1 and MED-1 from the August 2026 audit
-- =====================================================

-- =====================================================
-- HIGH-1: Fix get_signed_upload_url
-- Previously: granted to anon, no ownership check
-- Fixed:  revoke anon access, enforce caller ownership
-- =====================================================

-- Step 1: Revoke anon access (was a security gap)
REVOKE EXECUTE ON FUNCTION public.get_signed_upload_url(UUID) FROM anon;

-- Step 2: Replace function with an ownership-checked version
-- Callers must own the upload record OR be an admin
CREATE OR REPLACE FUNCTION public.get_signed_upload_url(p_upload_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_storage_path TEXT;
  v_signed_url   TEXT;
BEGIN
  -- Ownership gate: only the record's owner or an admin may generate the URL
  SELECT storage_path INTO v_storage_path
  FROM public.customer_uploads
  WHERE id = p_upload_id
    AND (user_id = auth.uid() OR public.is_admin());

  IF v_storage_path IS NULL THEN
    RAISE EXCEPTION 'Upload not found or access denied';
  END IF;

  -- Generate a short-lived signed URL (1 hour)
  SELECT signed_url INTO v_signed_url
  FROM storage.create_signed_url('customer-uploads', v_storage_path, 3600);

  RETURN v_signed_url;
END;
$$;

-- Restore the authenticated grant (anon intentionally excluded)
GRANT EXECUTE ON FUNCTION public.get_signed_upload_url(UUID) TO authenticated;


-- =====================================================
-- MED-1: Fix claim_uploads_for_user
-- Previously: accepted p_user_id parameter — any authenticated
--             user could reassign uploads to any other user
-- Fixed:  remove the p_user_id parameter entirely; use auth.uid()
--         internally so callers can only claim for themselves
-- =====================================================

-- Step 1: Drop the old two-parameter version
DROP FUNCTION IF EXISTS public.claim_uploads_for_user(TEXT, UUID);

-- Step 2: Create the secure single-parameter version
CREATE FUNCTION public.claim_uploads_for_user(p_session_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Callers can only claim uploads for their own authenticated uid
  UPDATE public.customer_uploads
  SET user_id    = auth.uid(),
      session_id = NULL
  WHERE session_id = p_session_id
    AND user_id IS NULL
    AND auth.uid() IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_uploads_for_user(TEXT) TO authenticated;
