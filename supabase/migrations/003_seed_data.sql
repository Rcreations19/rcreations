-- =====================================================
-- R Creation Enterprise E-Commerce Seed Data
-- Migration 003: Initial Catalog Data
-- Migrated from existing catalog.ts
-- =====================================================

-- =====================================================
-- CATEGORIES
-- =====================================================
INSERT INTO public.categories (id, name, slug, description, display_order, is_active) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Photo Frames', 'frames', 'Synthetic wood photo frames and acrylic LED displays', 1, true),
  ('c1000000-0000-0000-0000-000000000002', 'Crystal & Trophies', 'trophies', 'Crystal glass awards, trophies and memento shields', 2, true),
  ('c1000000-0000-0000-0000-000000000003', 'Personalized Gifts', 'gifts', 'Laser engraved plaques, corporate gift sets', 3, true),
  ('c1000000-0000-0000-0000-000000000004', 'Accessories', 'accessories', 'Framing hardware, mounting kits, presentation boxes', 4, true);

-- =====================================================


-- =====================================================
-- FRAME OPTIONS (for configurator)
-- =====================================================
INSERT INTO public.frame_options (name, material, category, unit_price, color_hex, color_name, durability, description) VALUES
  ('Matte Black Synthetic Wood Molding', 'High-Density Polymer (PS)', 'molding', 180, '#1a1a1a', 'Matte Black', 'Heavy Duty', 'Moisture-resistant 38mm synthetic profile suitable for certificates and posters.'),
  ('Grained Teak Finish Molding', 'Engineered Fibreboard & Foil', 'molding', 220, '#8b5a2b', 'Teak Brown', 'Premium Industrial', 'Textured natural wood grain finish with protective clear laminate coating.'),
  ('Gold Carved Accent Molding', 'Embossed Resin & Synthetic Wood', 'molding', 310, '#d4af37', 'Antique Gold', 'Premium Industrial', 'Traditional ornate border profile used for family portraits and religious artwork.'),
  ('Edge-Lit Acrylic LED Base', 'Cast Acrylic & Aluminium Rail', 'acrylic', 450, '#38c8cc', 'Clear / Cyan Glow', 'Premium Industrial', '4mm optical-grade cast acrylic plate with 12V strip illumination for trophies and logos.'),
  ('Polished Rosewood Memento Base', 'Solid Seasoned Rosewood', 'wood', 380, '#4a1525', 'Deep Rosewood', 'Heavy Duty', 'Weighted wooden block base tailored for brass plaques and recognition mementos.'),
  ('Sublimation Brass Metal Sheet', 'Anodized Aluminium & Brass Alloy', 'metal', 150, '#e5c158', 'Brushed Gold Metal', 'Standard', '0.8mm scratch-resistant metallic sheet designed for high-precision thermal printing and laser etching.');

-- =====================================================


-- =====================================================
-- SITE SETTINGS (default configuration)
-- =====================================================
INSERT INTO public.site_settings (key, value) VALUES
  ('business_name', '"R Creation"'),
  ('business_tagline', '"Your Trusted Partner for Premium Photographic Goods and Custom Personalized Products"'),
  ('business_location', '{"address": "Gudiyattam, Vellore District, Tamil Nadu", "pincode": "632602"}'),
  ('business_phone', '"+91 98765 43210"'),
  ('business_email', '"contact@rcreation.in"'),
  ('business_ceo', '"Mr. Sankaran Raveendiran"'),
  ('business_hours', '"Mon - Sat: 9:00 AM - 8:00 PM"'),
  ('gstin', '"33AAAAA0000A1Z5"'),
  ('wholesale_moq', '10'),
  ('free_shipping_threshold', '2000');
