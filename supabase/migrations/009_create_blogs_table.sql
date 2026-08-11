-- Create trigger function if it does not exist
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text NOT NULL,
  content text NOT NULL,
  cover_image_url text,
  is_published boolean DEFAULT false,
  author text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to published blogs"
  ON public.blogs
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Allow admin read access to all blogs"
  ON public.blogs
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Allow admin insert access"
  ON public.blogs
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Allow admin update access"
  ON public.blogs
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Allow admin delete access"
  ON public.blogs
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_blogs_modtime
    BEFORE UPDATE ON public.blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
