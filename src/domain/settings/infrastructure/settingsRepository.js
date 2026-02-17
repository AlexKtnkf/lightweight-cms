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
      // Try to create with social_links column, fallback if column doesn't exist
      try {
        const createSql = `INSERT INTO settings (id, site_title, social_links, updated_at) VALUES (1, 'My Site', ?, datetime('now'))`;
        await db.run(createSql, [defaultSocialLinks]);
      } catch (err) {
        // If social_links column doesn't exist, create without it
        const createSql = `INSERT INTO settings (id, site_title, updated_at) VALUES (1, 'My Site', datetime('now'))`;
        await db.run(createSql);
      }
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
    
    // Try to update with social_links column
    try {
      const sql = `UPDATE settings 
                   SET site_title = ?, site_tagline = ?, logo_media_id = ?,
                       header_menu_links = ?, footer_menu_links = ?, footer_text = ?,
                       social_links = ?,
                       updated_at = datetime('now')
                   WHERE id = 1`;
      await db.run(sql, [
        settingsData.site_title || 'AH',
        settingsData.site_tagline || null,
        settingsData.logo_media_id || null,
        settingsData.header_menu_links ? JSON.stringify(settingsData.header_menu_links) : '[]',
        settingsData.footer_menu_links ? JSON.stringify(settingsData.footer_menu_links) : '[]',
        settingsData.footer_text || null,
        settingsData.social_links ? JSON.stringify(settingsData.social_links) : defaultSocialLinks
      ]);
    } catch (err) {
      // If social_links column doesn't exist, update without it
      const sql = `UPDATE settings 
                   SET site_title = ?, site_tagline = ?, logo_media_id = ?,
                       header_menu_links = ?, footer_menu_links = ?, footer_text = ?,
                       updated_at = datetime('now')
                   WHERE id = 1`;
      await db.run(sql, [
        settingsData.site_title || 'AH',
        settingsData.site_tagline || null,
        settingsData.logo_media_id || null,
        settingsData.header_menu_links ? JSON.stringify(settingsData.header_menu_links) : '[]',
        settingsData.footer_menu_links ? JSON.stringify(settingsData.footer_menu_links) : '[]',
        settingsData.footer_text || null
      ]);
    }
    return this.get();
  }
}

module.exports = new SettingsRepository();
