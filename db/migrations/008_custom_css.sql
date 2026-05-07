-- Migration 008: Add custom_css column to settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS custom_css TEXT;
