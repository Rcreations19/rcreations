-- Fix: customer_otps needs a unique constraint on email for upsert with onConflict: 'email'
-- Without this, the upsert in registerCustomer fails at runtime

-- First, clean up any duplicate emails (keep the most recent OTP per email)
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM public.customer_otps
)
DELETE FROM public.customer_otps
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- Now create the unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_otps_email ON public.customer_otps(email);
