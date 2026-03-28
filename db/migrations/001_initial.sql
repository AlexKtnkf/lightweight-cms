-- ============================================
-- Initial Database Schema
-- Lightweight CMS for Adeline Hage
-- PostgreSQL
-- ============================================

-- Pages (static pages, appear in header/footer menus, use blocks like articles)
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  image_media_id INTEGER,
  lang TEXT DEFAULT 'fr',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  meta_title TEXT,
  meta_description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_id INTEGER
);

-- Articles (blog posts)
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  published_at TIMESTAMP,
  published BOOLEAN DEFAULT FALSE,
  lang TEXT DEFAULT 'fr',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  meta_title TEXT,
  meta_description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_id INTEGER
);

-- Unified blocks table (used by articles, pages, and homepage)
-- Complex blocks keep their nested items inside block_data JSON (e.g. FAQ items)
CREATE TABLE IF NOT EXISTS content_blocks (
  id SERIAL PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id INTEGER NOT NULL,
  block_type TEXT NOT NULL,
  block_order INTEGER NOT NULL,
  block_data TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site settings (site-wide configuration)
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  site_title TEXT NOT NULL DEFAULT 'My Site',
  site_tagline TEXT,
  allow_search_indexing BOOLEAN DEFAULT TRUE,
  logo_media_id INTEGER,
  header_menu_links TEXT DEFAULT '[]',
  footer_menu_links TEXT DEFAULT '[]',
  footer_text TEXT,
  social_links TEXT DEFAULT '[]',
  contact_email TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Homepage content (hero section stored here, accroches stored as blocks)
CREATE TABLE IF NOT EXISTS homepage (
  id SERIAL PRIMARY KEY,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_cta_text TEXT,
  hero_cta_url TEXT,
  hero_cta_secondary_text TEXT,
  hero_cta_secondary_url TEXT,
  logo_media_id INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media files
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  path TEXT NOT NULL,
  mime_type TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  thumbnail_path TEXT,
  webp_path TEXT,
  alt_text TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users (for admin authentication)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  form_data TEXT NOT NULL,
  visitor_email TEXT,
  visitor_ip TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read BOOLEAN DEFAULT FALSE,
  responded_at TIMESTAMP,
  notes TEXT,
  archived BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_blocks_content ON content_blocks(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published, published_at);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(published);
CREATE INDEX IF NOT EXISTS idx_contact_submitted_at ON contact_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_submissions(read);
CREATE INDEX IF NOT EXISTS idx_contact_archived ON contact_submissions(archived);

-- Insert default homepage (page id = 1)
INSERT INTO pages (id, title, slug, published, meta_title, meta_description)
VALUES (1, 'Page d''accueil', 'homepage', TRUE, 'Page d''accueil', 'Bienvenue sur notre site')
ON CONFLICT DO NOTHING;
