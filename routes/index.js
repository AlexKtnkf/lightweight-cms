const express = require('express');
const router = express.Router();
const pageController = require('../src/presentation/web/pageController');
const shopController = require('../src/presentation/web/shopController');
const appointmentsController = require('../src/presentation/web/appointmentsController');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');
const { isEnabled } = require('../src/shared/featureFlags');
const settingsRepository = require('../src/domain/settings/infrastructure/settingsRepository');
const shouldServeStaticFiles = process.env.NODE_ENV === 'production';

// Homepage route - check for static file first, fallback to dynamic
router.get('/', async (req, res, next) => {
  if (!shouldServeStaticFiles) {
    return pageController.index(req, res, next);
  }

  const staticPath = path.join(__dirname, '../public/static', 'index.html');
  
  try {
    const stats = await fs.stat(staticPath);
    if (stats.isFile()) {
      // Serve static homepage directly (fastest - no EJS rendering)
      res.set({
        'Cache-Control': 'no-cache, max-age=0, must-revalidate',
        'Last-Modified': stats.mtime.toUTCString()
      });
      return res.sendFile(path.resolve(staticPath));
    }
  } catch (error) {
    // File doesn't exist or error reading - fall through to dynamic rendering
    if (error.code !== 'ENOENT') {
      logger.error('Error checking static homepage:', error);
    }
  }
  
  // Fallback to dynamic rendering
  return pageController.index(req, res, next);
});

// Public routes (blog gated by FEATURE_SECTION_BLOG)
router.get('/blog', (req, res, next) => {
  if (!isEnabled('FEATURE_SECTION_BLOG')) return res.status(404).next ? next() : res.status(404).render('errors/404');
  return pageController.blog(req, res, next);
});
router.get('/blog/:slug', (req, res, next) => {
  if (!isEnabled('FEATURE_SECTION_BLOG')) return res.status(404).render('errors/404');
  return pageController.article(req, res, next);
});

// Shop routes (gated by FEATURE_SECTION_SHOP)
// Webhook needs raw body — must come before /:slug and after bodyParser setup
router.post('/boutique/webhook', (req, res, next) => {
  if (!isEnabled('FEATURE_SECTION_SHOP')) return res.status(404).send('Not found');
  return shopController.stripeWebhook(req, res, next);
});
router.get('/boutique', (req, res, next) => {
  if (!isEnabled('FEATURE_SECTION_SHOP')) return res.status(404).render('errors/404');
  return shopController.shopIndex(req, res, next);
});
router.get('/boutique/merci', (req, res, next) => {
  if (!isEnabled('FEATURE_SECTION_SHOP')) return res.status(404).render('errors/404');
  return shopController.checkoutSuccess(req, res, next);
});
router.post('/boutique/:id/checkout', (req, res, next) => {
  if (!isEnabled('FEATURE_SECTION_SHOP')) return res.status(404).json({ error: 'Not found' });
  return shopController.createCheckout(req, res, next);
});
router.get('/boutique/:slug', (req, res, next) => {
  if (!isEnabled('FEATURE_SECTION_SHOP')) return res.status(404).render('errors/404');
  return shopController.shopProduct(req, res, next);
});

// Appointments routes (gated by FEATURE_SECTION_APPOINTMENTS)
router.get('/rdv', (req, res, next) => {
  if (!isEnabled('FEATURE_SECTION_APPOINTMENTS')) return res.status(404).render('errors/404');
  return appointmentsController.rdvIndex(req, res, next);
});
router.get('/rdv/slots', (req, res, next) => {
  if (!isEnabled('FEATURE_SECTION_APPOINTMENTS')) return res.status(404).json({ error: 'Not found' });
  return appointmentsController.listSlots(req, res, next);
});
router.post('/rdv/book', (req, res, next) => {
  if (!isEnabled('FEATURE_SECTION_APPOINTMENTS')) return res.status(404).json({ error: 'Not found' });
  return appointmentsController.createBooking(req, res, next);
});

// Static pages route - check for static file first, fallback to dynamic
router.get('/:slug', async (req, res, next) => {
  const { slug } = req.params;
  
  // Skip static file check for known dynamic routes
  if (['sitemap.xml', 'robots.txt', 'feed.xml'].includes(slug)) {
    return next();
  }

  if (!shouldServeStaticFiles) {
    return pageController.page(req, res, next);
  }
  
  // Check if static file exists
  const staticPath = path.join(__dirname, '../public/static', `${slug}.html`);
  
  try {
    const stats = await fs.stat(staticPath);
    if (stats.isFile()) {
      // Serve static file directly (fastest - no EJS rendering)
      res.set({
        'Cache-Control': 'no-cache, max-age=0, must-revalidate',
        'Last-Modified': stats.mtime.toUTCString()
      });
      return res.sendFile(path.resolve(staticPath));
    }
  } catch (error) {
    // File doesn't exist or error reading - fall through to dynamic rendering
    if (error.code !== 'ENOENT') {
      logger.error('Error checking static file:', error);
    }
  }
  
  // Fallback to dynamic rendering (for unpublished pages or if static file missing)
  return pageController.page(req, res, next);
});

// SEO routes (gated by feature flags)
router.get('/sitemap.xml', (req, res, next) => {
  if (!isEnabled('FEATURE_PUBLIC_SITEMAP')) return res.status(404).send('Not found');
  return pageController.sitemap(req, res, next);
});
router.get('/robots.txt', pageController.robots);
router.get('/feed.xml', (req, res, next) => {
  if (!isEnabled('FEATURE_PUBLIC_RSS')) return res.status(404).send('Not found');
  return pageController.feed(req, res, next);
});

// Theme CSS overrides — dynamically generated from settings.theme_tokens
router.get('/css/custom.css', async (req, res) => {
  try {
    const settings = await settingsRepository.get();
    const tokens = settings.theme_tokens || {};
    const entries = Object.entries(tokens).filter(([k]) => k.startsWith('--'));

    if (entries.length === 0) {
      res.set('Content-Type', 'text/css');
      return res.send('/* no custom theme tokens */\n');
    }

    const vars = entries.map(([k, v]) => `  ${k}: ${v};`).join('\n');
    const css = `:root {\n${vars}\n}\n`;

    res.set({
      'Content-Type': 'text/css',
      'Cache-Control': 'public, max-age=300'
    });
    res.send(css);
  } catch (err) {
    logger.error('Error generating custom.css:', err);
    res.set('Content-Type', 'text/css');
    res.send('/* error loading theme tokens */\n');
  }
});

module.exports = router;
