require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { securityHeaders, generalLimiter } = require('./config/security');
const errorHandler = require('./middleware/errorHandler');
const db = require('./src/infrastructure/database/database');
const logger = require('./utils/logger');

// Import routes
const indexRoutes = require('./routes/index');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const adminApiRoutes = require('./routes/admin-api');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
const expressLayouts = require('express-ejs-layouts');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main'); // Default layout for public routes

// Security middleware
app.use(securityHeaders);
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Static files (including generated static pages)
// In development, disable caching for CSS to see changes immediately
if (process.env.NODE_ENV !== 'production') {
  app.use('/css', express.static(path.join(__dirname, 'public/css'), {
    setHeaders: (res) => {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }));
}
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'public/static')));

// Load settings middleware (for public routes)
const loadSettings = require('./middleware/settings');
app.use(loadSettings);

// Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminApiRoutes); // Admin API (JSON responses)

// Admin routes - login/logout only (React handles the rest)
app.use('/admin', adminRoutes);

// Serve built admin panel (in production) - after login route
if (process.env.NODE_ENV === 'production') {
  app.use('/admin', express.static(path.join(__dirname, 'public/admin')));
  // Fallback to index.html for client-side routing (skip login route)
  app.get('/admin/*', (req, res, next) => {
    // Skip login and API routes
    if (req.path === '/admin/login' || req.path.startsWith('/admin/api') || req.path.match(/\.(js|css|png|jpg|svg|ico)$/)) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'public/admin/index.html'));
  });
}

app.use('/', indexRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).render('errors/404', {
    gaId: process.env.GA_ID || ''
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Generate static content on startup (in production)
  // Run asynchronously so it doesn't block server startup
  if (process.env.NODE_ENV === 'production') {
    setImmediate(() => {
      const staticGenerator = require('./src/infrastructure/static/staticGenerator');
      staticGenerator.generateAll().catch(err => {
        logger.error('Error generating static content on startup:', err);
      });
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

module.exports = app;
