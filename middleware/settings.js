const fs = require('fs').promises;
const path = require('path');
const GetSettings = require('../src/domain/settings/application/GetSettings');
const settingsRepository = require('../src/domain/settings/infrastructure/settingsRepository');

const getSettings = new GetSettings(settingsRepository);

/**
 * Middleware to load settings and make them available to all views
 */
async function loadSettings(req, res, next) {
  try {
    const settings = await getSettings.execute();
    res.locals.settings = settings;
    
    // Load logo SVG for navbar
    try {
      const logoSvgPath = path.join(__dirname, '../public/media/logo.svg');
      res.locals.logoSvg = await fs.readFile(logoSvgPath, 'utf8');
    } catch (err) {
      // Logo SVG not found, navbar will use text fallback
      res.locals.logoSvg = '';
    }
    
    next();
  } catch (error) {
    // If settings don't exist, create defaults
    console.error('Error loading settings:', error);
    res.locals.settings = {
      site_title: 'My Site',
      site_tagline: null,
      logo_media_id: null,
      header_menu_links: [],
      footer_menu_links: [],
      footer_text: null
    };
    res.locals.logoSvg = '';
    next();
  }
}

module.exports = loadSettings;
