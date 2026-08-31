-- Add image_url to frame_options for the catalog section
ALTER TABLE public.frame_options
ADD COLUMN image_url text;
