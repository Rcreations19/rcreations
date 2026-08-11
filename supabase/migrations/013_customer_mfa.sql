-- Create table for customer registration OTPs
CREATE TABLE IF NOT EXISTS public.customer_otps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  full_name text,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL
);

-- Secure it
ALTER TABLE public.customer_otps ENABLE ROW LEVEL SECURITY;

-- Only service role can access this
CREATE POLICY "Service role can manage customer otps"
  ON public.customer_otps
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
