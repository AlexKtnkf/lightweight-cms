-- ============================================
-- Add theme_tokens JSONB column to settings for per-deployment style overrides.
-- Stores a JSON object mapping CSS variable names to values, e.g.:
--   { "--color-primary": "#e85d26", "--font-body": "Georgia, serif" }
-- ============================================

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS theme_tokens JSONB;
