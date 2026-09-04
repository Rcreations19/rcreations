-- =====================================================
-- Migration 017: Abandoned Carts
-- =====================================================

CREATE TABLE public.abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'recovered', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for quick lookups
CREATE INDEX idx_abandoned_carts_session ON public.abandoned_carts(session_id);
CREATE INDEX idx_abandoned_carts_status ON public.abandoned_carts(status);
CREATE INDEX idx_abandoned_carts_email ON public.abandoned_carts(email) WHERE email IS NOT NULL;
CREATE INDEX idx_abandoned_carts_updated ON public.abandoned_carts(updated_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_abandoned_carts_updated_at 
  BEFORE UPDATE ON public.abandoned_carts 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: Only admins (or service role) can view/manage all.
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Note: We do not need an insert policy for public because we will write to this
-- table using the service_role client from a secure API route.

CREATE POLICY "Admins can manage abandoned carts"
ON public.abandoned_carts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
