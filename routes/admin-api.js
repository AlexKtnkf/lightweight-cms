const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { requireFeature } = require('../middleware/auth');
const { uploadLimiter } = require('../config/security');
const { flags } = require('../src/shared/featureFlags');

// Repositories (infrastructure) - from domain infrastructure
const pageRepository = require('../src/domain/content/infrastructure/pageRepository');
const articleRepository = require('../src/domain/content/infrastructure/articleRepository');
const blockRepository = require('../src/domain/content/infrastructure/blockRepository');
const mediaRepository = require('../src/domain/media/infrastructure/mediaRepository');
const settingsRepository = require('../src/domain/settings/infrastructure/settingsRepository');

// No services needed - all logic in use cases

// Infrastructure
const staticGenerator = require('../src/infrastructure/static/staticGenerator');
const RobotsGenerator = require('../src/shared/utils/robotsGenerator');
const upload = require('../config/upload');
const backupService = require('../db/backup-db');
const mediaBackupService = require('../db/backup-media');

// Use cases (application) - Pages
const CreatePage = require('../src/domain/content/application/CreatePage');
const UpdatePage = require('../src/domain/content/application/UpdatePage');
const GetPage = require('../src/domain/content/application/GetPage');
const ListPages = require('../src/domain/content/application/ListPages');
const DeletePage = require('../src/domain/content/application/DeletePage');

// Use cases (application) - Articles
const CreateArticle = require('../src/domain/content/application/CreateArticle');
const UpdateArticle = require('../src/domain/content/application/UpdateArticle');
const GetArticle = require('../src/domain/content/application/GetArticle');
const ListArticles = require('../src/domain/content/application/ListArticles');
const DeleteArticle = require('../src/domain/content/application/DeleteArticle');

// Use cases (application) - Media
const UploadMedia = require('../src/domain/media/application/UploadMedia');
const ListMedia = require('../src/domain/media/application/ListMedia');
const DeleteMedia = require('../src/domain/media/application/DeleteMedia');

// Use cases (application) - Settings
const GetSettings = require('../src/domain/settings/application/GetSettings');
const UpdateSettings = require('../src/domain/settings/application/UpdateSettings');

// Controllers (presentation)
const PagesController = require('../src/presentation/api/admin/pagesController');
const ArticlesController = require('../src/presentation/api/admin/articlesController');
const MediaController = require('../src/presentation/api/admin/mediaController');
const SettingsController = require('../src/presentation/api/admin/settingsController');
const authController = require('../src/presentation/api/admin/authController');

// Instantiate use cases - Pages
const createPage = new CreatePage(pageRepository, blockRepository, staticGenerator);
const updatePage = new UpdatePage(pageRepository, blockRepository, staticGenerator);
const getPage = new GetPage(pageRepository, blockRepository);
const listPages = new ListPages(pageRepository);
const deletePage = new DeletePage(pageRepository, blockRepository, staticGenerator);

// Instantiate use cases - Articles
const createArticle = new CreateArticle(articleRepository, blockRepository);
const updateArticle = new UpdateArticle(articleRepository, blockRepository);
const getArticle = new GetArticle(articleRepository, blockRepository);
const listArticles = new ListArticles(articleRepository);
const deleteArticle = new DeleteArticle(articleRepository, blockRepository);

// Instantiate controllers
const pagesController = new PagesController(
  createPage,
  updatePage,
  deletePage,
  getPage,
  listPages
);

const articlesController = new ArticlesController(
  createArticle,
  updateArticle,
  deleteArticle,
  getArticle,
  listArticles
);

// Storage adapter (local filesystem or S3-compatible object storage)
const { createStorageAdapter } = require('../config/storage');
const storageAdapter = createStorageAdapter();

// Instantiate use cases - Media
const uploadMedia = new UploadMedia(mediaRepository, storageAdapter);
const listMedia = new ListMedia(mediaRepository);
const deleteMedia = new DeleteMedia(mediaRepository, storageAdapter);

// Instantiate controller - Media
const mediaController = new MediaController(uploadMedia, listMedia, deleteMedia);

// Instantiate use cases - Settings
const getSettings = new GetSettings(settingsRepository);
const updateSettings = new UpdateSettings(settingsRepository);

// Instantiate infrastructure - Robots generator
const robotsGenerator = new RobotsGenerator();

// Instantiate controller - Settings
const settingsController = new SettingsController(getSettings, updateSettings, staticGenerator, robotsGenerator, backupService, mediaBackupService);

// Feature flags endpoint — unauthenticated, deployment-level info
router.get('/features', (req, res) => res.json(flags));

// Setup and token-based recovery must stay reachable before session auth
router.post('/auth/reset-password', (req, res, next) => authController.resetPassword(req, res, next));
router.post('/auth/setup-admin', (req, res, next) => authController.setupAdmin(req, res, next));

// All remaining admin routes require authentication
router.use(requireAuth);

// Pages API routes
router.get('/pages', (req, res, next) => pagesController.list(req, res, next));
router.get('/pages/:id', (req, res, next) => pagesController.get(req, res, next));
router.post('/pages', (req, res, next) => pagesController.create(req, res, next));
router.put('/pages/:id', (req, res, next) => pagesController.update(req, res, next));
router.delete('/pages/:id', (req, res, next) => pagesController.delete(req, res, next));

// Articles API routes (gated by FEATURE_SECTION_BLOG)
router.get('/articles', requireFeature('FEATURE_SECTION_BLOG'), (req, res, next) => articlesController.list(req, res, next));
router.get('/articles/:id', requireFeature('FEATURE_SECTION_BLOG'), (req, res, next) => articlesController.get(req, res, next));
router.post('/articles', requireFeature('FEATURE_SECTION_BLOG'), (req, res, next) => articlesController.create(req, res, next));
router.put('/articles/:id', requireFeature('FEATURE_SECTION_BLOG'), (req, res, next) => articlesController.update(req, res, next));
router.delete('/articles/:id', requireFeature('FEATURE_SECTION_BLOG'), (req, res, next) => articlesController.delete(req, res, next));

// Media API routes
router.get('/media', (req, res, next) => mediaController.list(req, res, next));
// Apply upload limiter specifically for uploads (more lenient than general limiter)
router.post('/media/upload', uploadLimiter, upload.single('file'), (req, res, next) => mediaController.upload(req, res, next));
router.delete('/media/:id', (req, res, next) => mediaController.delete(req, res, next));

// Current user profile
router.get('/auth/me', (req, res, next) => authController.me(req, res, next));

// Settings API routes — write access restricted to admin+
const { requireRole } = require('../middleware/auth');
router.get('/settings', (req, res, next) => settingsController.get(req, res, next));
router.put('/settings', requireRole(['admin', 'super_admin']), (req, res, next) => settingsController.update(req, res, next));
router.post('/regenerate', requireRole(['admin', 'super_admin']), (req, res, next) => settingsController.regenerate(req, res, next));
router.post('/backup', requireRole(['super_admin']), (req, res, next) => settingsController.backup(req, res, next));
router.get('/backup/media', requireRole(['super_admin']), (req, res, next) => settingsController.downloadMediaBackup(req, res, next));

// Users API routes — super_admin only
router.get('/users', requireRole(['super_admin']), (req, res, next) => authController.listUsers(req, res, next));
router.post('/users', requireRole(['super_admin']), (req, res, next) => authController.createUser(req, res, next));
router.patch('/users/:id', requireRole(['super_admin']), (req, res, next) => authController.updateUser(req, res, next));
router.delete('/users/:id', requireRole(['super_admin']), (req, res, next) => authController.deleteUser(req, res, next));

module.exports = router;
