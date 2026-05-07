const fs = require('fs').promises;
const path = require('path');
const GetSettings = require('../src/domain/settings/application/GetSettings');
const settingsRepository = require('../src/domain/settings/infrastructure/settingsRepository');

const getSettings = new GetSettings(settingsRepository);

// In-process cache — avoids a DB query + filesystem read on every request.
// TTL of 30 s means settings changes are visible within 30 s without any
// explicit invalidation logic.
const CACHE_TTL_MS = 30 * 1000;
let cache = null; // { settings, logoSvg, expiresAt }

/** Force the next request to bypass the cache (called after settings update). */
function invalidateSettingsCache() {
  cache = null;
}

/**
 * Middleware to load settings and make them available to all views
 */
async function loadSettings(req, res, next) {
  try {
    const now = Date.now();

    if (!cache || now > cache.expiresAt) {
      const settings = await getSettings.execute();

      let logoSvg = '';
      try {
        const logoSvgPath = path.join(__dirname, '../public/media/logo.svg');
        logoSvg = await fs.readFile(logoSvgPath, 'utf8');
      } catch {
        // Logo SVG not found, navbar will use text fallback
      }

      cache = { settings, logoSvg, expiresAt: now + CACHE_TTL_MS };
    }

    res.locals.settings = cache.settings;
    res.locals.logoSvg = cache.logoSvg;
    res.locals.turnstileSiteKey = process.env.TURNSTILE_SITE_KEY || null;
    res.locals.baseUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;

    next();
  } catch (error) {
    // If settings don't exist, serve safe defaults and let the request continue
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
    res.locals.turnstileSiteKey = process.env.TURNSTILE_SITE_KEY || null;
    res.locals.baseUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
    next();
  }
}

module.exports = loadSettings;
module.exports.invalidateSettingsCache = invalidateSettingsCache;
