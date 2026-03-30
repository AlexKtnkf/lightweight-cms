-- ============================================
-- Settings table compatibility for older production databases
-- Adds columns that may be missing on databases created before the
-- current settings schema existed.
-- ============================================

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS site_tagline TEXT,
  ADD COLUMN IF NOT EXISTS allow_search_indexing BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS logo_media_id INTEGER,
  ADD COLUMN IF NOT EXISTS header_menu_links TEXT DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS footer_menu_links TEXT DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS footer_text TEXT,
  ADD COLUMN IF NOT EXISTS social_links TEXT DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE settings
SET
  header_menu_links = COALESCE(header_menu_links, '[]'),
  footer_menu_links = COALESCE(footer_menu_links, '[]'),
  social_links = COALESCE(social_links, '[]'),
  allow_search_indexing = COALESCE(allow_search_indexing, FALSE),
  updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP);

ALTER TABLE settings
  ALTER COLUMN header_menu_links SET DEFAULT '[]',
  ALTER COLUMN footer_menu_links SET DEFAULT '[]',
  ALTER COLUMN social_links SET DEFAULT '[]',
  ALTER COLUMN allow_search_indexing SET DEFAULT FALSE,
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
