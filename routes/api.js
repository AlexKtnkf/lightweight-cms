const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Use cases
const GetPage = require('../src/domain/content/application/GetPage');
const GetPageBySlug = require('../src/domain/content/application/GetPageBySlug');
const GetArticleBySlug = require('../src/domain/content/application/GetArticleBySlug');
const ListPublishedArticles = require('../src/domain/content/application/ListPublishedArticles');

// Repositories
const pageRepository = require('../src/domain/content/infrastructure/pageRepository');
const articleRepository = require('../src/domain/content/infrastructure/articleRepository');
const blockRepository = require('../src/domain/content/infrastructure/blockRepository');
const mediaRepository = require('../src/domain/media/infrastructure/mediaRepository');

// Instantiate use cases
const getPage = new GetPage(pageRepository, blockRepository);
const getPageBySlug = new GetPageBySlug(pageRepository, blockRepository);
const getArticleBySlug = new GetArticleBySlug(articleRepository, blockRepository);
const listPublishedArticles = new ListPublishedArticles(articleRepository);

// Public API routes (no auth required)
router.get('/articles', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const articles = await listPublishedArticles.execute({ limit, offset });
    res.json(articles);
  } catch (error) {
    next(error);
  }
});

router.get('/articles/:slug', async (req, res, next) => {
  try {
    const article = await getArticleBySlug.execute(req.params.slug);
    res.json(article);
  } catch (error) {
    next(error);
  }
});

router.get('/pages', async (req, res, next) => {
  try {
    const pages = await pageRepository.findAll();
    res.json(pages);
  } catch (error) {
    next(error);
  }
});

router.get('/pages/:slug', async (req, res, next) => {
  try {
    const page = await getPageBySlug.execute(req.params.slug);
    res.json(page);
  } catch (error) {
    next(error);
  }
});

router.get('/homepage', async (req, res, next) => {
  try {
    // Homepage is now page id 1
    const homepage = await getPage.execute(1);
    res.json(homepage);
  } catch (error) {
    next(error);
  }
});

// Media API - serve media files
router.get('/media/:id', async (req, res, next) => {
  try {
    const media = await mediaRepository.findById(parseInt(req.params.id));
    if (!media) {
      return res.status(404).json({ error: 'File not found' });
    }
    const filePath = path.join(__dirname, '../public', media.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
