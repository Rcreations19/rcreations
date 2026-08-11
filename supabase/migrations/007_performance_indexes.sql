-- =====================================================
-- Migration 007: Enterprise Performance Indexes
-- =====================================================

-- Improve Admin Dashboard query speeds
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_active ON public.products(category_id, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_date ON public.orders(status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product_qty ON public.order_items(product_id, quantity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inquiries_status_type ON public.inquiries(status, inquiry_type);

-- Full text search indexing for products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(specifications::text, '')), 'C')
) STORED;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search ON public.products USING GIN (search_vector);
