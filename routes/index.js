const express = require('express');
const router = express.Router();
const pageController = require('../src/presentation/web/pageController');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

// Homepage route - check for static file first, fallback to dynamic
router.get('/', async (req, res, next) => {
  const staticPath = path.join(__dirname, '../public/static', 'index.html');
  
  try {
    const stats = await fs.stat(staticPath);
    if (stats.isFile()) {
      // Serve static homepage directly (fastest - no EJS rendering)
      res.set({
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
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

// Public routes
router.get('/blog', pageController.blog);
router.get('/blog/:slug', pageController.article);

// Static pages route - check for static file first, fallback to dynamic
router.get('/:slug', async (req, res, next) => {
  const { slug } = req.params;
  
  // Skip static file check for known dynamic routes
  if (['sitemap.xml', 'robots.txt', 'feed.xml'].includes(slug)) {
    return next();
  }
  
  // Check if static file exists
  const staticPath = path.join(__dirname, '../public/static', `${slug}.html`);
  
  try {
    const stats = await fs.stat(staticPath);
    if (stats.isFile()) {
      // Serve static file directly (fastest - no EJS rendering)
      // Set cache headers for performance
      res.set({
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
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

// SEO routes
router.get('/sitemap.xml', pageController.sitemap);
router.get('/robots.txt', pageController.robots);
router.get('/feed.xml', pageController.feed);

module.exports = router;
