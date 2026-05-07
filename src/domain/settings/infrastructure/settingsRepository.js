const db = require('../../../infrastructure/database/database');

class SettingsRepository {
  // Get settings (there's only one)
  async get() {
    const sql = `SELECT * FROM settings WHERE id = 1`;
    let settings = await db.get(sql);
    
    if (!settings) {
      // Create default settings if they don't exist
      const defaultSocialLinks = JSON.stringify([
        { platform: 'instagram', url: 'https://instagram.com', icon: 'instagram' },
        { platform: 'facebook', url: 'https://facebook.com', icon: 'facebook' },
        { platform: 'linkedin', url: 'https://linkedin.com', icon: 'linkedin' }
      ]);
      const createSql = `INSERT INTO settings (id, site_title, header_menu_links, footer_menu_links, social_links, allow_search_indexing, updated_at)
                         VALUES (1, 'My Site', '[]', '[]', ?, TRUE, CURRENT_TIMESTAMP)
                         ON CONFLICT (id) DO NOTHING`;
      await db.run(createSql, [defaultSocialLinks]);
      settings = await db.get(sql);
    }
    
    // Parse JSON fields
    if (settings.header_menu_links) {
      settings.header_menu_links = JSON.parse(settings.header_menu_links);
    } else {
      settings.header_menu_links = [];
    }
    
    if (settings.footer_menu_links) {
      settings.footer_menu_links = JSON.parse(settings.footer_menu_links);
    } else {
      settings.footer_menu_links = [];
    }
    
    // Parse social_links JSON field
    if (settings.social_links) {
      settings.social_links = JSON.parse(settings.social_links);
    } else {
      // Default social links if none exist
      settings.social_links = [
        { platform: 'instagram', url: 'https://instagram.com', icon: 'instagram' },
        { platform: 'facebook', url: 'https://facebook.com', icon: 'facebook' },
        { platform: 'linkedin', url: 'https://linkedin.com', icon: 'linkedin' }
      ];
    }

    // theme_tokens is JSONB — pg returns it pre-parsed; handle text fallback
    if (settings.theme_tokens && typeof settings.theme_tokens === 'string') {
      try {
        settings.theme_tokens = JSON.parse(settings.theme_tokens);
      } catch {
        settings.theme_tokens = {};
      }
    } else if (!settings.theme_tokens) {
      settings.theme_tokens = {};
    }

    // custom_css is plain text — leave as-is
    settings.custom_css = settings.custom_css || null;

    return settings;
  }

  // Update settings
  async update(settingsData) {
    // Default social links if not provided
    const defaultSocialLinks = JSON.stringify([
      { platform: 'instagram', url: 'https://instagram.com', icon: 'instagram' },
      { platform: 'facebook', url: 'https://facebook.com', icon: 'facebook' },
      { platform: 'linkedin', url: 'https://linkedin.com', icon: 'linkedin' }
    ]);
    
    const sql = `INSERT INTO settings (
                   id, site_title, site_tagline, logo_media_id,
                   header_menu_links, footer_menu_links, footer_text,
                   social_links, allow_search_indexing, contact_email,
                   theme_tokens, custom_css, updated_at
                 )
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                 ON CONFLICT (id) DO UPDATE
                 SET site_title = EXCLUDED.site_title,
                     site_tagline = EXCLUDED.site_tagline,
                     logo_media_id = EXCLUDED.logo_media_id,
                     header_menu_links = EXCLUDED.header_menu_links,
                     footer_menu_links = EXCLUDED.footer_menu_links,
                     footer_text = EXCLUDED.footer_text,
                     social_links = EXCLUDED.social_links,
                     allow_search_indexing = EXCLUDED.allow_search_indexing,
                     contact_email = EXCLUDED.contact_email,
                     theme_tokens = EXCLUDED.theme_tokens,
                     custom_css = EXCLUDED.custom_css,
                     updated_at = CURRENT_TIMESTAMP`;
    await db.run(sql, [
      1,
      settingsData.site_title || 'AH',
      settingsData.site_tagline || null,
      settingsData.logo_media_id || null,
      settingsData.header_menu_links ? JSON.stringify(settingsData.header_menu_links) : '[]',
      settingsData.footer_menu_links ? JSON.stringify(settingsData.footer_menu_links) : '[]',
      settingsData.footer_text || null,
      settingsData.social_links ? JSON.stringify(settingsData.social_links) : defaultSocialLinks,
      settingsData.allow_search_indexing !== undefined ? Boolean(settingsData.allow_search_indexing) : true,
      settingsData.contact_email || null,
      settingsData.theme_tokens ? JSON.stringify(settingsData.theme_tokens) : null,
      settingsData.custom_css || null
    ]);
    return this.get();
  }
}

module.exports = new SettingsRepository();
