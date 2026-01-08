const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');

// Repositories (infrastructure) - from domain infrastructure
const pageRepository = require('../src/domains/content/infrastructure/pageRepository');
const articleRepository = require('../src/domains/content/infrastructure/articleRepository');
const blockRepository = require('../src/domains/content/infrastructure/blockRepository');
const mediaRepository = require('../src/domains/media/infrastructure/mediaRepository');
const settingsRepository = require('../src/domains/settings/infrastructure/settingsRepository');

// No services needed - all logic in use cases

// Infrastructure
const staticGenerator = require('../src/infrastructure/static/staticGenerator');
const upload = require('../config/upload');

// Use cases (application) - Pages
const CreatePage = require('../src/domains/content/application/CreatePage');
const UpdatePage = require('../src/domains/content/application/UpdatePage');
const GetPage = require('../src/domains/content/application/GetPage');
const ListPages = require('../src/domains/content/application/ListPages');
const DeletePage = require('../src/domains/content/application/DeletePage');

// Use cases (application) - Articles
const CreateArticle = require('../src/domains/content/application/CreateArticle');
const UpdateArticle = require('../src/domains/content/application/UpdateArticle');
const GetArticle = require('../src/domains/content/application/GetArticle');
const ListArticles = require('../src/domains/content/application/ListArticles');
const DeleteArticle = require('../src/domains/content/application/DeleteArticle');

// Use cases (application) - Media
const UploadMedia = require('../src/domains/media/application/UploadMedia');
const ListMedia = require('../src/domains/media/application/ListMedia');
const DeleteMedia = require('../src/domains/media/application/DeleteMedia');

// Use cases (application) - Settings
const GetSettings = require('../src/domains/settings/application/GetSettings');
const UpdateSettings = require('../src/domains/settings/application/UpdateSettings');

// Controllers (presentation)
const PagesController = require('../src/presentation/api/admin/pagesController');
const ArticlesController = require('../src/presentation/api/admin/articlesController');
const MediaController = require('../src/presentation/api/admin/mediaController');
const SettingsController = require('../src/presentation/api/admin/settingsController');

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

// Instantiate use cases - Media
const uploadMedia = new UploadMedia(mediaRepository);
const listMedia = new ListMedia(mediaRepository);
const deleteMedia = new DeleteMedia(mediaRepository);

// Instantiate controller - Media
const mediaController = new MediaController(uploadMedia, listMedia, deleteMedia);

// Instantiate use cases - Settings
const getSettings = new GetSettings(settingsRepository);
const updateSettings = new UpdateSettings(settingsRepository);

// Instantiate controller - Settings
const settingsController = new SettingsController(getSettings, updateSettings);

// All routes require authentication
router.use(requireAuth);

// Pages API routes
router.get('/pages', (req, res, next) => pagesController.list(req, res, next));
router.get('/pages/:id', (req, res, next) => pagesController.get(req, res, next));
router.post('/pages', (req, res, next) => pagesController.create(req, res, next));
router.put('/pages/:id', (req, res, next) => pagesController.update(req, res, next));
router.delete('/pages/:id', (req, res, next) => pagesController.delete(req, res, next));

// Articles API routes
router.get('/articles', (req, res, next) => articlesController.list(req, res, next));
router.get('/articles/:id', (req, res, next) => articlesController.get(req, res, next));
router.post('/articles', (req, res, next) => articlesController.create(req, res, next));
router.put('/articles/:id', (req, res, next) => articlesController.update(req, res, next));
router.delete('/articles/:id', (req, res, next) => articlesController.delete(req, res, next));

// Media API routes
router.get('/media', (req, res, next) => mediaController.list(req, res, next));
router.post('/media/upload', upload.single('file'), (req, res, next) => mediaController.upload(req, res, next));
router.delete('/media/:id', (req, res, next) => mediaController.delete(req, res, next));

// Settings API routes
router.get('/settings', (req, res, next) => settingsController.get(req, res, next));
router.put('/settings', (req, res, next) => settingsController.update(req, res, next));

module.exports = router;
