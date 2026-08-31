-- =====================================================
-- Migration 20260828000001: Speed and Security Audit
-- =====================================================

-- 1. Performance Indexes for frequently queried filtering columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_frame_options_active_category ON public.frame_options(is_active, category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blogs_is_published ON public.blogs(is_published) WHERE is_published = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_b2b ON public.reviews(is_published, order_type) WHERE is_published = true AND order_type IN ('Corporate Gift', 'Wholesale Bulk');
