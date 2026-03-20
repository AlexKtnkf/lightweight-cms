# Database Setup Guide

This folder contains everything needed to manage the CMS database lifecycle.

## Files Overview

- **`migrate.js`** - Runs all SQL migrations from the `migrations/` folder in order
- **`seed.js`** - Seeds initial data (settings, homepage content, blocks, logo media)
- **`create-admin.js`** - Interactive CLI to create admin users (run separately)
- **`migrations/`** - SQL migration files (version controlled, idempotent)

## Setup Workflow

### Fresh Setup (Development)

```bash
# 1. Run all migrations to create database schema
npm run migrate

# 2. Seed example data (homepage, settings, demo content, logo)
npm run seed

# 3. Create admin user (interactive)
npm run create-admin

# 4. Generate static files
npm run generate-static
```

Or as a single command:
```bash
npm run setup && npm run create-admin && npm run generate-static
```

### Production Setup

```bash
# 1. Run migrations
npm run migrate

# 2. Seed only (no example data)
npm run seed

# 3. Create admin user
npm run create-admin

# Note: Skip npm run generate-static if serving dynamic
```

## Database Schema

The migrations folder contains SQL files that define the complete schema:

- **001_initial.sql** - Core tables (pages, articles, blocks, media, settings, users, homepage)
- **002_add_social_links.sql** - Add social links feature
- **003_add_allow_search_indexing.sql** - Add search engine indexing toggle

## Seeding

The `seed.js` file consolidates initialization of:

1. **Settings** - Site title, menus, branding, social links
2. **Homepage Page** - Meta tags and basic page record
3. **Content Blocks** - Hero section, FAQ, contact form, and example blocks
4. **Logo Media** - Registers the logo.svg file as media (if present)

### Customization

Edit `seed.js` to customize:
- `SETTINGS` object - Site title, menus, social links
- `HOMEPAGE_PAGE` object - Meta tags and page title
- `BLOCKS` array - Homepage sections and content

## Creating Admin Users

```bash
npm run create-admin
```

This opens an interactive prompt:
```
Nom d'utilisateur: admin
Mot de passe: ••••••••
✓ Utilisateur admin "admin" créé avec succès
```

## Notes

- All migrations are idempotent (safe to re-run)
- Seeding recreates all homepage blocks each run
- Logo seeding is optional (skips if logo.svg not found)
- Settings are upserted (created if missing, updated if exists)
