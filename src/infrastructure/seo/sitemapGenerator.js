const articleRepository = require('../../domain/content/infrastructure/articleRepository');
const pageRepository = require('../../domain/content/infrastructure/pageRepository');

class SitemapGenerator {
  constructor(articleRepository, pageRepository) {
    this.articleRepository = articleRepository;
    this.pageRepository = pageRepository;
  }

  /**
   * Generate sitemap.xml
   */
  async generateSitemap(baseUrl) {
    const articles = await this.articleRepository.findAll(1000, 0);
    const pages = await this.pageRepository.findAll();

    const urls = [
      { loc: baseUrl, priority: '1.0' },
      { loc: `${baseUrl}/blog`, priority: '0.8' }
    ];

    // Add published pages
    pages.forEach(page => {
      urls.push({
        loc: `${baseUrl}/${page.slug}`,
        priority: '0.7',
        lastmod: page.updated_at
      });
    });

    // Add published articles
    articles.forEach(article => {
      urls.push({
        loc: `${baseUrl}/blog/${article.slug}`,
        priority: '0.6',
        lastmod: article.updated_at || article.published_at || article.created_at
      });
    });

    return this.buildSitemapXML(urls);
  }

  buildSitemapXML(urls) {
    const urlElements = urls.map(url => {
      const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : '';
      return `  <url>
    <loc>${url.loc}</loc>
    <priority>${url.priority}</priority>${lastmod}
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
  }

  /**
   * Generate robots.txt
   */
  generateRobotsTxt(sitemapUrl) {
    return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}`;
  }
}

module.exports = SitemapGenerator;
