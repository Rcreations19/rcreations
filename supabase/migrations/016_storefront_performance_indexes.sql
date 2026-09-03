-- =====================================================
-- Migration 016: Storefront Performance Indexes
-- =====================================================

-- This index optimizes the Bestsellers query on the homepage.
-- It filters by is_bestseller and orders by rating DESC.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_bestseller_rating 
ON public.products(is_bestseller, rating DESC);

-- Also ensure we have a dedicated index for is_active, 
-- which is the most heavily used filter across all public queries.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_is_active
ON public.products(is_active);
