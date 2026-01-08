const GetSettings = require('../src/domains/settings/application/GetSettings');
const settingsRepository = require('../src/domains/settings/infrastructure/settingsRepository');

const getSettings = new GetSettings(settingsRepository);

/**
 * Middleware to load settings and make them available to all views
 */
async function loadSettings(req, res, next) {
  try {
    const settings = await getSettings.execute();
    res.locals.settings = settings;
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
    next();
  }
}

module.exports = loadSettings;
