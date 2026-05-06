-- ============================================
-- Add src column to media table for object storage support.
-- For local storage, src is NULL and the path column is used.
-- For object storage, src holds the full public URL of the original image.
-- ============================================

ALTER TABLE media
  ADD COLUMN IF NOT EXISTS src TEXT;
