const fs = require('fs').promises;
const path = require('path');
const ejs = require('ejs');
const logger = require('../../../utils/logger');

// Use cases
const GetPage = require('../../domain/content/application/GetPage');
const ListPages = require('../../domain/content/application/ListPages');
const GetSettings = require('../../domain/settings/application/GetSettings');
const CreatePage = require('../../domain/content/application/CreatePage');

// Repositories
const pageRepository = require('../../domain/content/infrastructure/pageRepository');
const blockRepository = require('../../domain/content/infrastructure/blockRepository');
const settingsRepository = require('../../domain/settings/infrastructure/settingsRepository');

/**
 * Static file generator for pages
 * Generates static HTML files for published pages (not accroches, not articles)
 */
class StaticGenerator {
  constructor(getPage, listPages, getSettings, createPage, pageRepository) {
    this.getPage = getPage;
    this.listPages = listPages;
    this.getSettings = getSettings;
    this.createPage = createPage;
    this.pageRepository = pageRepository;
    this.staticDir = path.join(__dirname, '../../../public/static');
    this.viewsDir = path.join(__dirname, '../../../views');
  }

  /**
   * Ensure static directory exists
   */
  async ensureStaticDir() {
    try {
      await fs.mkdir(this.staticDir, { recursive: true });
    } catch (error) {
      logger.error('Error creating static directory:', error);
      throw error;
    }
  }

  /**
   * Generate static HTML for a single page
   */
  async generatePage(page) {
    await this.ensureStaticDir();

    // Only generate static files for published pages
    if (!page.published) {
      // Delete static file if page is unpublished
      await this.deletePage(page.slug);
      return;
    }

    try {
      // Load full page data with blocks
      const fullPage = await this.getPage.execute(page.id);
      
      // Render the page template
      const templatePath = path.join(this.viewsDir, 'pages/page.ejs');
      const template = await fs.readFile(templatePath, 'utf8');
      
      // Get pages list for navigation
      const pages = await this.pageRepository.findAll();
      const JSONLD = require('../../../utils/jsonLd');
      const settings = await this.getSettings.execute();
      // For static generation, use SITE_HOST from env or default
      const baseUrl = process.env.SITE_HOST ? `https://${process.env.SITE_HOST}` : 'https://example.com';
      
      // Generate JSON-LD schemas
      const pageSchema = JSONLD.webPage(baseUrl, fullPage, settings);
      const breadcrumbs = JSONLD.breadcrumbList(baseUrl, [
        { name: settings?.site_title || 'My Site', url: '/' },
        { name: fullPage.title, url: `/${fullPage.slug}` }
      ]);
      
      const html = ejs.render(template, {
        page: fullPage,
        pages: pages, // For navigation
        settings: settings,
        baseUrl: baseUrl,
        jsonLd: [pageSchema, breadcrumbs],
        gaId: process.env.GA_ID || ''
      }, {
        views: [this.viewsDir],
        filename: templatePath
      });

      // Write to static file
      const staticPath = path.join(this.staticDir, `${page.slug}.html`);
      await fs.writeFile(staticPath, html, 'utf8');
      
      // Set file permissions (readable by web server)
      await fs.chmod(staticPath, 0o644);
      
      logger.info(`Generated static file: ${page.slug}.html`);
    } catch (error) {
      logger.error(`Error generating static file for page ${page.slug}:`, error);
      throw error;
    }
  }

  /**
   * Generate static HTML for all published pages
   */
  async generateAllPages() {
    const pages = await this.pageRepository.findAllAdmin(1000, 0);
    const publishedPages = pages.filter(p => p.published);
    
    logger.info(`Generating ${publishedPages.length} static page(s)...`);
    
    for (const page of publishedPages) {
      await this.generatePage(page);
    }
    
    logger.info('All static pages generated');
  }

  /**
   * Generate all static content (homepage + pages)
   */
  async generateAll() {
    await this.ensureStaticDir();
    logger.info('Generating all static content...');
    await this.generateHomepage();
    await this.generateAllPages();
    logger.info('All static content generated');
  }

  /**
   * Delete static file for a page
   */
  async deletePage(slug) {
    try {
      const staticPath = path.join(this.staticDir, `${slug}.html`);
      await fs.unlink(staticPath);
      logger.info(`Deleted static file: ${slug}.html`);
    } catch (error) {
      // File might not exist, ignore
      if (error.code !== 'ENOENT') {
        logger.error(`Error deleting static file for ${slug}:`, error);
      }
    }
  }

  /**
   * Generate static HTML for homepage
   */
  async generateHomepage() {
    await this.ensureStaticDir();
    
    try {
      // Homepage is now page id 1
      let homepage;
      try {
        homepage = await this.getPage.execute(1);
      } catch (error) {
        // If homepage doesn't exist, create it
        if (error.status === 404) {
          homepage = await this.createPage.execute({
            id: 1,
            title: 'Page d\'accueil',
            slug: 'homepage',
            published: true
          });
        } else {
          throw error;
        }
      }
      
      const pages = await this.pageRepository.findAll(); // For navigation
      
      // Render the homepage template
      const templatePath = path.join(this.viewsDir, 'pages/index.ejs');
      const template = await fs.readFile(templatePath, 'utf8');
      
      const JSONLD = require('../../../utils/jsonLd');
      const settings = await this.getSettings.execute();
      // For static generation, use SITE_HOST from env or default
      const baseUrl = process.env.SITE_HOST ? `https://${process.env.SITE_HOST}` : 'https://example.com';
      
      // Generate JSON-LD schemas
      const orgSchema = JSONLD.organization(baseUrl, settings);
      const websiteSchema = JSONLD.website(baseUrl, settings);
      
      const html = ejs.render(template, {
        homepage: homepage,
        pages: pages, // For navigation
        settings: settings,
        baseUrl: baseUrl,
        jsonLd: [orgSchema, websiteSchema],
        gaId: process.env.GA_ID || ''
      }, {
        views: [this.viewsDir],
        filename: templatePath
      });

      // Write to static file
      const staticPath = path.join(this.staticDir, 'index.html');
      await fs.writeFile(staticPath, html, 'utf8');
      
      // Set file permissions (readable by web server)
      await fs.chmod(staticPath, 0o644);
      
      logger.info('Generated static file: index.html (homepage)');
    } catch (error) {
      logger.error('Error generating static homepage:', error);
      throw error;
    }
  }

  /**
   * Regenerate all static pages (useful after migrations or bulk updates)
   * Alias for generateAll() for backward compatibility
   */
  async regenerateAll() {
    await this.generateAll();
  }
}

// Instantiate use cases
const getPage = new GetPage(pageRepository, blockRepository);
const listPages = new ListPages(pageRepository);
const getSettings = new GetSettings(settingsRepository);

// Create instance first (createPage will be set later to avoid circular dependency)
const staticGeneratorInstance = new StaticGenerator(
  getPage,
  listPages,
  getSettings,
  null, // createPage will be set below
  pageRepository
);

// Now create createPage with staticGenerator reference
const createPage = new CreatePage(pageRepository, blockRepository, staticGeneratorInstance);
staticGeneratorInstance.createPage = createPage;

module.exports = staticGeneratorInstance;
