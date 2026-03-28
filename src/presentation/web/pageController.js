// Use cases
const GetPage = require('../../domain/content/application/GetPage');
const GetPageBySlug = require('../../domain/content/application/GetPageBySlug');
const GetArticleBySlug = require('../../domain/content/application/GetArticleBySlug');
const ListPublishedArticles = require('../../domain/content/application/ListPublishedArticles');
const CreatePage = require('../../domain/content/application/CreatePage');
const GetSettings = require('../../domain/settings/application/GetSettings');
const SitemapGenerator = require('../../infrastructure/seo/sitemapGenerator');
const FeedGenerator = require('../../infrastructure/rss/feedGenerator');

// Repositories
const pageRepository = require('../../domain/content/infrastructure/pageRepository');
const blockRepository = require('../../domain/content/infrastructure/blockRepository');
const articleRepository = require('../../domain/content/infrastructure/articleRepository');
const settingsRepository = require('../../domain/settings/infrastructure/settingsRepository');

// Infrastructure
const staticGenerator = require('../../infrastructure/static/staticGenerator');

// Instantiate use cases
const getPage = new GetPage(pageRepository, blockRepository);
const getPageBySlug = new GetPageBySlug(pageRepository, blockRepository);
const getArticleBySlug = new GetArticleBySlug(articleRepository, blockRepository);
const listPublishedArticles = new ListPublishedArticles(articleRepository);
const createPage = new CreatePage(pageRepository, blockRepository, staticGenerator);
const getSettings = new GetSettings(settingsRepository);
const sitemapGenerator = new SitemapGenerator(articleRepository, pageRepository);
const feedGenerator = new FeedGenerator(articleRepository, settingsRepository);

const JSONLD = require('../../../utils/jsonLd');

function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateText(text = '', maxLength = 220) {
  if (text.length <= maxLength) {
    return text;
  }

  const candidate = text.slice(0, maxLength + 1);
  const lastSpace = candidate.lastIndexOf(' ');
  const cutoff = lastSpace > Math.floor(maxLength * 0.6) ? lastSpace : maxLength;
  return `${candidate.slice(0, cutoff).trim()}…`;
}

async function buildBlogArticlePreview(article) {
  const fallbackExcerpt = (article.meta_description || '').trim();
  if (fallbackExcerpt) {
    return {
      ...article,
      excerpt: fallbackExcerpt,
    };
  }

  const blocks = blockRepository.parseBlocks(
    await blockRepository.findByContent('article', article.id)
  );
  const richText = blocks.find(block => block.block_type === 'rich_text')?.block_data?.richText || '';

  return {
    ...article,
    excerpt: truncateText(stripHtml(richText)),
  };
}

class PageController {
  async index(req, res, next) {
    try {
      // Homepage is now page id 1
      let homepage;
      try {
        homepage = await getPage.execute(1);
      } catch (error) {
        // If homepage doesn't exist, create it
        if (error.status === 404) {
          homepage = await createPage.execute({
            id: 1,
            title: 'Page d\'accueil',
            slug: 'homepage',
            published: true
          });
        } else {
          throw error;
        }
      }
      
      const settings = await getSettings.execute();
      const pages = await pageRepository.findAll();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Generate JSON-LD schemas
      const orgSchema = JSONLD.organization(baseUrl, settings);
      const websiteSchema = JSONLD.website(baseUrl, settings);
      
      res.render('pages/index', { 
        homepage,
        settings,
        pages,
        baseUrl,
        jsonLd: [orgSchema, websiteSchema],
        gaId: process.env.GA_ID || ''
      });
    } catch (error) {
      next(error);
    }
  }

  async blog(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      const articles = await listPublishedArticles.execute({ limit, offset });
      const articlePreviews = await Promise.all(articles.map(buildBlogArticlePreview));
      const settings = await getSettings.execute();
      const pages = await pageRepository.findAll();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Generate JSON-LD schemas
      const collectionSchema = JSONLD.collectionPage(baseUrl, settings);
      const breadcrumbs = JSONLD.breadcrumbList(baseUrl, [
        { name: settings?.site_title || 'My Site', url: '/' },
        { name: 'Blog', url: '/blog' }
      ]);
      
      res.render('pages/blog', { 
        articles: articlePreviews,
        settings,
        pages,
        baseUrl,
        jsonLd: [collectionSchema, breadcrumbs],
        gaId: process.env.GA_ID || ''
      });
    } catch (error) {
      next(error);
    }
  }

  async article(req, res, next) {
    try {
      const { slug } = req.params;
      const article = await getArticleBySlug.execute(slug);
      const pages = await pageRepository.findAll();
      const settings = await getSettings.execute();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Generate JSON-LD schemas
      const articleSchema = JSONLD.article(baseUrl, article, settings);
      const breadcrumbs = JSONLD.breadcrumbList(baseUrl, [
        { name: settings?.site_title || 'My Site', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: article.title, url: `/blog/${article.slug}` }
      ]);
      
      res.render('pages/article', { 
        article,
        pages,
        settings,
        baseUrl,
        jsonLd: [articleSchema, breadcrumbs],
        gaId: process.env.GA_ID || ''
      });
    } catch (error) {
      next(error);
    }
  }

  async page(req, res, next) {
    try {
      const { slug } = req.params;
      const page = await getPageBySlug.execute(slug);
      const pages = await pageRepository.findAll();
      const settings = await getSettings.execute();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Generate JSON-LD schemas
      const pageSchema = JSONLD.webPage(baseUrl, page, settings);
      const breadcrumbs = JSONLD.breadcrumbList(baseUrl, [
        { name: settings?.site_title || 'My Site', url: '/' },
        { name: page.title, url: `/${page.slug}` }
      ]);
      
      res.render('pages/page', { 
        page,
        pages,
        settings,
        baseUrl,
        jsonLd: [pageSchema, breadcrumbs],
        gaId: process.env.GA_ID || ''
      });
    } catch (error) {
      next(error);
    }
  }

  async sitemap(req, res, next) {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const sitemap = await sitemapGenerator.generateSitemap(baseUrl);
      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      next(error);
    }
  }

  async robots(req, res, next) {
    try {
      const settings = await getSettings.execute();
      const allowIndexing = settings?.allow_search_indexing !== undefined ? settings.allow_search_indexing : true;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      let robots;
      if (allowIndexing) {
        robots = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml`;
      } else {
        robots = `User-agent: *\nDisallow: /`;
      }
      
      res.set('Content-Type', 'text/plain');
      res.send(robots);
    } catch (error) {
      next(error);
    }
  }

  async feed(req, res, next) {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const feed = await feedGenerator.generateFeed(baseUrl);
      res.set('Content-Type', 'application/rss+xml');
      res.send(feed);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PageController();
