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
const uploadsRoot = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, 'public/uploads');

// Trust proxy when behind reverse proxy (nginx, Cloudflare, etc.)
// Required for correct client IPs in rate limiting and logging
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// View engine setup
const expressLayouts = require('express-ejs-layouts');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main'); // Default layout for public routes

// Security middleware
app.use(securityHeaders);

// Apply general rate limiter, but skip admin routes (API, Vite dev server, static assets)
app.use((req, res, next) => {
  // Skip rate limiting for:
  // - Admin API routes (they have their own auth)
  // - Admin panel routes (Vite dev server in dev, static files in prod)
  // - Vite dev server assets (@vite, @react-refresh, etc.)
  if (
    req.path.startsWith('/api/admin') ||
    req.path.startsWith('/admin') ||
    req.path.startsWith('/@vite') ||
    req.path.startsWith('/@react-refresh') ||
    req.path.startsWith('/@fs')
  ) {
    return next();
  }
  // Apply general limiter for all other routes
  generalLimiter(req, res, next);
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
// Set secure to false for localhost/HTTP development
// In production with HTTPS, set FORCE_HTTPS=true in env
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  name: '__Host-sid',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  }
};

// Warn if default session secret is used in production
if (process.env.NODE_ENV === 'production' && sessionConfig.secret === 'change-this-secret-in-production') {
  logger.error('CRITICAL: Using default SESSION_SECRET in production. Set a strong random secret!');
  process.exit(1);
}

// In development, allow insecure cookies and simpler name
if (process.env.NODE_ENV !== 'production') {
  sessionConfig.cookie.secure = false;
  sessionConfig.name = 'sessionId';
}

app.use(session(sessionConfig));

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
app.use('/uploads', express.static(uploadsRoot));

// Load settings middleware (for public routes)
const loadSettings = require('./middleware/settings');
app.use(loadSettings);

// Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminApiRoutes); // Admin API (JSON responses)

// Health endpoint for load balancers / Railway
app.get('/health', async (req, res) => {
  try {
    // Basic DB connectivity check
    let dbOk = false;
    try {
      const row = await db.get('SELECT 1 AS ok');
      if (row) dbOk = true;
    } catch (err) {
      // some DB adapters may throw for simple selects; treat as failure
      dbOk = false;
    }

    return res.status(200).json({ status: 'ok', db: dbOk });
  } catch (err) {
    return res.status(500).json({ status: 'error' });
  }
});

// Admin routes - only POST /admin/login and GET /admin/logout
// GET /admin/login is handled by Vite (React app), not Express
const { loginLimiter } = require('./config/security');
const adminController = require('./src/presentation/web/adminController');
app.post('/admin/login', loginLimiter, adminController.login);
app.get('/admin/logout', adminController.logout);

// Serve admin panel - Vite dev server in development, static files in production
if (process.env.NODE_ENV === 'production') {
  // Production: serve built static files
  app.use('/admin', express.static(path.join(__dirname, 'public/admin')));
  // Fallback to index.html for client-side routing (matches /admin and /admin/*)
  app.get(['/admin', '/admin/*'], (req, res, next) => {
    // Skip API routes and static assets
    if (req.path.startsWith('/admin/api') || req.path.match(/\.(js|css|png|jpg|svg|ico|woff|woff2|ttf|eot)$/)) {
      return next();
    }
    // Serve index.html for all admin routes (including /admin, /admin/login, etc.)
    res.sendFile(path.join(__dirname, 'public/admin/index.html'));
  });
  
  // Start server (production)
  startServer();
} else {
  // Development: use Vite middleware to serve React app with HMR
  const vitePackagePath = require.resolve('vite/package.json', {
    paths: [path.join(__dirname, 'admin')]
  });
  const { createServer: createViteServer } = require(path.dirname(vitePackagePath));
  const adminBuildDir = path.join(__dirname, 'public/admin');
  const adminAssetPattern = /\.(js|css|png|jpg|svg|ico|woff|woff2|ttf|eot)$/;
  
  // Store Vite server reference for placeholder middleware
  let viteServerInstance = null;
  let useStaticAdminFallback = false;
  
  // Register placeholder middleware BEFORE 404 handler
  // This ensures admin routes (including module requests) are handled correctly
  app.use((req, res, next) => {
    // Skip API routes - they should be handled by Express routes above
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // Only handle admin routes (skip API routes)
    if (!req.path.startsWith('/admin')) {
      return next();
    }
    
    // If Vite is ready, delegate to it
    if (viteServerInstance) {
      return viteServerInstance.middlewares(req, res, next);
    }

    if (useStaticAdminFallback) {
      if (req.path.startsWith('/admin/api')) {
        return next();
      }

      if (adminAssetPattern.test(req.path)) {
        const relativeAssetPath = req.path.replace(/^\/admin\/?/, '');
        return res.sendFile(path.join(adminBuildDir, relativeAssetPath), (err) => {
          if (err) next();
        });
      }

      return res.sendFile(path.join(adminBuildDir, 'index.html'));
    }
    
    // Wait for Vite to be ready (should be very quick)
    const maxWait = 3000;
    const startTime = Date.now();
    
    const waitForVite = () => {
      if (viteServerInstance) {
        return viteServerInstance.middlewares(req, res, next);
      }
      if (Date.now() - startTime > maxWait) {
        return res.status(503).send('Admin panel is initializing, please refresh...');
      }
      setImmediate(waitForVite);
    };
    
    waitForVite();
  });
  
  // Initialize Vite asynchronously
  (async () => {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        root: path.join(__dirname, 'admin'),
        base: '/admin/',
        configLoader: 'runner',
        mode: 'development', // Force development mode for better error messages
        define: {
          'process.env.NODE_ENV': '"development"',
        },
      });
      
      viteServerInstance = vite;
      
      // Also register Vite middleware directly for proper module handling
      app.use(vite.middlewares);
      
      logger.info('Vite dev server initialized');
    } catch (err) {
      logger.error('Failed to start Vite dev server:', err.message);
      if (require('fs').existsSync(path.join(adminBuildDir, 'index.html'))) {
        useStaticAdminFallback = true;
        logger.warn('Serving static admin build as a fallback because Vite failed to start');
      } else {
        logger.warn('Admin panel will not be available, but backend API continues to work');
      }
    } finally {
      // Start server regardless of Vite success (backend API should work)
      startServer();
    }
  })();
}

// Public routes
app.use('/', indexRoutes);

// 404 handler
app.use((req, res, next) => {
  // Skip admin routes - they're handled by Vite middleware (dev) or static files (prod)
  if (req.path.startsWith('/admin') && !req.path.startsWith('/admin/api')) {
    return next(); // Let Vite or static file handler deal with it
  }
  res.status(404).render('errors/404', {
    gaId: process.env.GA_ID || ''
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server function
function startServer() {
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
}

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
