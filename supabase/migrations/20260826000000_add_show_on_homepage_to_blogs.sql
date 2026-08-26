-- Add show_on_homepage to blogs table
ALTER TABLE blogs
ADD COLUMN show_on_homepage BOOLEAN NOT NULL DEFAULT false;

-- Create an index for faster queries on the homepage
CREATE INDEX idx_blogs_show_on_homepage ON blogs(show_on_homepage) WHERE show_on_homepage = true;
