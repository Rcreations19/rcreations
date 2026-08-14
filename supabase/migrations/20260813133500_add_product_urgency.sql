-- Add urgency marketing fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock_urgency_remaining INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS urgency_timer_title TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS urgency_timer_subtitle TEXT DEFAULT NULL;
