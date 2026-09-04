-- Add keywords column to blogs table for SEO optimization
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS keywords text;
