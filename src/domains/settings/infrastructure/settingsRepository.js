const db = require('../../../infrastructure/database/database');

class SettingsRepository {
  // Get settings (there's only one)
  async get() {
    const sql = `SELECT * FROM settings WHERE id = 1`;
    let settings = await db.get(sql);
    
    if (!settings) {
      // Create default settings if they don't exist
      const createSql = `INSERT INTO settings (id, site_title, updated_at) VALUES (1, 'My Site', datetime('now'))`;
      await db.run(createSql);
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
    
    return settings;
  }

  // Update settings
  async update(settingsData) {
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
    return this.get();
  }
}

module.exports = new SettingsRepository();
