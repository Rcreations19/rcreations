-- ============================================================
-- CUSTOMER UPLOADS: Private storage bucket for customer photos
-- ============================================================

-- Create private storage bucket for customer photo uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-uploads', 'customer-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================

-- Admin: full access to all customer uploads
CREATE POLICY "customer_uploads_admin_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'customer-uploads'
    AND public.is_admin()
  );

CREATE POLICY "customer_uploads_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'customer-uploads'
    AND public.is_admin()
  );

-- Server actions use service_role client (bypasses RLS)
-- No client-side INSERT/SELECT policies — all access via server actions

-- ============================================================
-- SEED DATA: Golden Ornate pattern (from user-uploaded image)
-- ============================================================
INSERT INTO public.frame_patterns (name, slug, material, category, description, base_price, image_url, is_active, sort_order)
VALUES (
  'Golden Ornate',
  'golden-ornate',
  'Solid Wood with Gold Leaf',
  'molding',
  'Premium hand-carved solid wood frame with intricate golden leaf detailing. Each piece features deep relief floral and scroll patterns for a luxurious, classic aesthetic.',
  450.00,
  '/images/patterns/golden-ornate.jpg',
  true,
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Seed widths for Golden Ornate
INSERT INTO public.frame_widths (pattern_id, width_inches, price_modifier, is_active, sort_order)
SELECT id, 0.50, 0, true, 1 FROM public.frame_patterns WHERE slug = 'golden-ornate'
ON CONFLICT (pattern_id, width_inches) DO NOTHING;

INSERT INTO public.frame_widths (pattern_id, width_inches, price_modifier, is_active, sort_order)
SELECT id, 1.00, 50, true, 2 FROM public.frame_patterns WHERE slug = 'golden-ornate'
ON CONFLICT (pattern_id, width_inches) DO NOTHING;

INSERT INTO public.frame_widths (pattern_id, width_inches, price_modifier, is_active, sort_order)
SELECT id, 1.50, 120, true, 3 FROM public.frame_patterns WHERE slug = 'golden-ornate'
ON CONFLICT (pattern_id, width_inches) DO NOTHING;

INSERT INTO public.frame_widths (pattern_id, width_inches, price_modifier, is_active, sort_order)
SELECT id, 2.00, 200, true, 4 FROM public.frame_patterns WHERE slug = 'golden-ornate'
ON CONFLICT (pattern_id, width_inches) DO NOTHING;

-- Seed finishes for Golden Ornate
INSERT INTO public.frame_finishes (pattern_id, name, slug, price_modifier, is_active, sort_order)
SELECT id, 'Classic Gold', 'classic-gold', 0, true, 1 FROM public.frame_patterns WHERE slug = 'golden-ornate'
ON CONFLICT (pattern_id, slug) DO NOTHING;

INSERT INTO public.frame_finishes (pattern_id, name, slug, price_modifier, is_active, sort_order)
SELECT id, 'Antique Bronze', 'antique-bronze', 80, true, 2 FROM public.frame_patterns WHERE slug = 'golden-ornate'
ON CONFLICT (pattern_id, slug) DO NOTHING;

INSERT INTO public.frame_finishes (pattern_id, name, slug, price_modifier, is_active, sort_order)
SELECT id, 'Satin Gold', 'satin-gold', 60, true, 3 FROM public.frame_patterns WHERE slug = 'golden-ornate'
ON CONFLICT (pattern_id, slug) DO NOTHING;
