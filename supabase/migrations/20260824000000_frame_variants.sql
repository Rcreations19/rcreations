-- ============================================================
-- FRAME VARIANTS: Dynamic pattern/width/finish system
-- Replaces hardcoded FRAME_OPTIONS in configurator page
-- ============================================================

-- 1. Patterns — the "look" of the frame (managed by admin)
CREATE TABLE public.frame_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  material TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('molding', 'acrylic', 'wood', 'metal')),
  description TEXT NOT NULL DEFAULT '',
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Widths — per pattern, with price modifier
CREATE TABLE public.frame_widths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES public.frame_patterns(id) ON DELETE CASCADE,
  width_inches NUMERIC(4,2) NOT NULL,
  price_modifier NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pattern_id, width_inches)
);

-- 3. Finishes — per pattern, independent of width
CREATE TABLE public.frame_finishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES public.frame_patterns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  price_modifier NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pattern_id, slug)
);

-- 4. Glass types
CREATE TABLE public.glass_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Mount boards
CREATE TABLE public.mount_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Customer photo uploads
CREATE TABLE public.customer_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size_bytes INT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
  width_px INT,
  height_px INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_ownership CHECK (
    (user_id IS NOT NULL AND session_id IS NULL)
    OR (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- 7. Extend order_items with photo + config
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS photo_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS custom_frame_config JSONB;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_frame_widths_pattern_id ON public.frame_widths(pattern_id);
CREATE INDEX idx_frame_finishes_pattern_id ON public.frame_finishes(pattern_id);
CREATE INDEX idx_customer_uploads_user_id ON public.customer_uploads(user_id);
CREATE INDEX idx_customer_uploads_session_id ON public.customer_uploads(session_id);
CREATE INDEX idx_customer_uploads_created_at ON public.customer_uploads(created_at);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- frame_patterns
CREATE POLICY "frame_patterns_select_public"
  ON public.frame_patterns FOR SELECT
  USING (is_active = true);

CREATE POLICY "frame_patterns_admin_all"
  ON public.frame_patterns FOR ALL
  USING (public.is_admin());

-- frame_widths
CREATE POLICY "frame_widths_select_public"
  ON public.frame_widths FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.frame_patterns
      WHERE id = frame_widths.pattern_id AND is_active = true
    )
  );

CREATE POLICY "frame_widths_admin_all"
  ON public.frame_widths FOR ALL
  USING (public.is_admin());

-- frame_finishes
CREATE POLICY "frame_finishes_select_public"
  ON public.frame_finishes FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.frame_patterns
      WHERE id = frame_finishes.pattern_id AND is_active = true
    )
  );

CREATE POLICY "frame_finishes_admin_all"
  ON public.frame_finishes FOR ALL
  USING (public.is_admin());

-- glass_types
CREATE POLICY "glass_types_select_public"
  ON public.glass_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "glass_types_admin_all"
  ON public.glass_types FOR ALL
  USING (public.is_admin());

-- mount_boards
CREATE POLICY "mount_boards_select_public"
  ON public.mount_boards FOR SELECT
  USING (is_active = true);

CREATE POLICY "mount_boards_admin_all"
  ON public.mount_boards FOR ALL
  USING (public.is_admin());

-- customer_uploads
CREATE POLICY "customer_uploads_select_auth_own"
  ON public.customer_uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "customer_uploads_insert_auth"
  ON public.customer_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "customer_uploads_select_admin"
  ON public.customer_uploads FOR SELECT
  USING (public.is_admin());

CREATE POLICY "customer_uploads_delete_admin"
  ON public.customer_uploads FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE public.frame_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_widths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glass_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mount_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_uploads ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_frame_patterns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_frame_patterns_updated_at
  BEFORE UPDATE ON public.frame_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_frame_patterns_updated_at();

-- ============================================================
-- RPC: Claim anonymous uploads for authenticated user
-- ============================================================
CREATE OR REPLACE FUNCTION public.claim_uploads_for_user(
  p_session_id TEXT,
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.customer_uploads
  SET user_id = p_user_id,
      session_id = NULL
  WHERE session_id = p_session_id
    AND user_id IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_uploads_for_user(TEXT, UUID) TO authenticated;

-- ============================================================
-- RPC: Get signed URL for customer upload
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_signed_upload_url(p_upload_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_storage_path TEXT;
  v_signed_url TEXT;
BEGIN
  -- Get the storage path
  SELECT storage_path INTO v_storage_path
  FROM public.customer_uploads
  WHERE id = p_upload_id;

  IF v_storage_path IS NULL THEN
    RAISE EXCEPTION 'Upload not found';
  END IF;

  -- Generate signed URL (1 hour expiry)
  SELECT signed_url INTO v_signed_url
  FROM storage.create_signed_url('customer-uploads', v_storage_path, 3600);

  RETURN v_signed_url;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_signed_upload_url(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_signed_upload_url(UUID) TO anon;

-- ============================================================
-- SEED DATA: Glass types and mount boards (defaults)
-- ============================================================
INSERT INTO public.glass_types (name, slug, description, price, sort_order) VALUES
  ('Clear Glass', 'clear-glass', 'Standard 2mm float glass', 0, 1),
  ('Anti-Glare Acrylic', 'anti-glare-acrylic', 'Shatterproof museum grade acrylic', 120, 2),
  ('LED Backlit Panel', 'led-backlit-panel', '12V edge-lit glowing base', 350, 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.mount_boards (name, slug, description, price, sort_order) VALUES
  ('No Mount (Full Bleed)', 'none', 'Photo fills the entire frame area', 0, 1),
  ('1-inch White Mount', 'single-white', 'Clean white border around photo', 60, 2),
  ('1-inch Black Mount', 'single-black', 'Classic black border around photo', 60, 3),
  ('Premium Double Mount', 'double', 'Layered mount with depth effect', 120, 4)
ON CONFLICT (slug) DO NOTHING;
