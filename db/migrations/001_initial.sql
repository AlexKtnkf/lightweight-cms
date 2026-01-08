-- ============================================
-- Initial Database Schema
-- Lightweight CMS for Adeline Hage
-- ============================================

-- Pages (static pages, appear in header/footer menus, use blocks like articles)
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  published BOOLEAN DEFAULT 0,
  image_media_id INTEGER, -- For pages with featured images
  lang TEXT DEFAULT 'fr', -- Language support (for future i18n)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_id INTEGER
);

-- Articles (blog posts)
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  published_at DATETIME,
  published BOOLEAN DEFAULT 0,
  lang TEXT DEFAULT 'fr', -- Language support (for future i18n)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_id INTEGER
);

-- Unified blocks table (used by articles, pages, and homepage)
CREATE TABLE IF NOT EXISTS content_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_type TEXT NOT NULL, -- 'article', 'page', or 'homepage'
  content_id INTEGER NOT NULL, -- References articles(id), pages(id), or homepage(id)
  block_type TEXT NOT NULL, -- 'rich_text', 'encart_principal', 'hero', 'question_reponse', 'accroche'
  block_order INTEGER NOT NULL, -- Order of block within content
  block_data TEXT NOT NULL, -- JSON data containing block-specific content
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Site settings (site-wide configuration)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_title TEXT NOT NULL DEFAULT 'My Site',
  site_tagline TEXT,
  logo_media_id INTEGER,
  header_menu_links TEXT DEFAULT '[]', -- JSON array of {label, url, order}
  footer_menu_links TEXT DEFAULT '[]', -- JSON array of {label, url, order}
  footer_text TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Homepage content (hero section stored here, accroches stored as blocks)
CREATE TABLE IF NOT EXISTS homepage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_cta_text TEXT,
  hero_cta_url TEXT,
  hero_cta_secondary_text TEXT,
  hero_cta_secondary_url TEXT,
  logo_media_id INTEGER,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Media files (attached to blocks, not directly to articles/pages)
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  path TEXT NOT NULL, -- Relative path from public/uploads/
  mime_type TEXT,
  file_size INTEGER, -- Size in bytes
  width INTEGER, -- For images
  height INTEGER, -- For images
  thumbnail_path TEXT, -- Path to thumbnail if image
  webp_path TEXT, -- Path to WebP version if image
  alt_text TEXT, -- Accessibility: alt text for images
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users (for admin authentication)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt hash
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_blocks_content ON content_blocks(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published, published_at);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(published);

-- Insert default homepage (page id = 1)
INSERT OR IGNORE INTO pages (
  id,
  title,
  slug,
  published,
  meta_title,
  meta_description,
  created_at,
  updated_at
) VALUES (
  1,
  'Page d''accueil',
  'homepage',
  1,
  'Page d''accueil',
  'Bienvenue sur notre site',
  datetime('now'),
  datetime('now')
);