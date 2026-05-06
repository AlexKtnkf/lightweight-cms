-- ============================================
-- Add role and email columns to users table.
-- role: 'super_admin' | 'admin' | 'editor'
-- email: optional, used for password reset / notifications
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'editor',
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Promote any pre-existing admin users to super_admin so existing
-- single-user deployments retain full access after this migration.
UPDATE users SET role = 'super_admin' WHERE role = 'editor';
