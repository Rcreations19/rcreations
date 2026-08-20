-- =====================================================
-- Fix CRITICAL-1: admin_notifications RLS
-- Drop overly permissive policies, replace with admin-only
-- =====================================================

-- Drop the existing overly permissive policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.admin_notifications;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.admin_notifications;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.admin_notifications;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.admin_notifications;

-- Admin-only SELECT
CREATE POLICY "Admins can read notifications"
  ON public.admin_notifications
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admin-only UPDATE
CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin-only INSERT (service role or admin)
CREATE POLICY "Admins can insert notifications"
  ON public.admin_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admin-only DELETE
CREATE POLICY "Admins can delete notifications"
  ON public.admin_notifications
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
