-- Add an attempts column to customer_otps to track brute force guesses
ALTER TABLE customer_otps ADD COLUMN IF NOT EXISTS attempts integer DEFAULT 0 NOT NULL;

-- Also add it to admin_otps just in case we ever want to use it there, 
-- though currently we will burn it on the first attempt anyway.
ALTER TABLE admin_otps ADD COLUMN IF NOT EXISTS attempts integer DEFAULT 0 NOT NULL;
