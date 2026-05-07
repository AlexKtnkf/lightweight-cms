const articleRepository = require('../../domain/content/infrastructure/articleRepository');
const pageRepository = require('../../domain/content/infrastructure/pageRepository');
const { isEnabled } = require('../../shared/featureFlags');

class SitemapGenerator {
  /**
   * @param {object} articleRepository
   * @param {object} pageRepository
   * @param {object} [productRepository]   optional — included when FEATURE_SECTION_SHOP is on
   * @param {object} [serviceRepository]   optional — included when FEATURE_SECTION_APPOINTMENTS is on
   */
  constructor(articleRepository, pageRepository, productRepository = null, serviceRepository = null) {
    this.articleRepository = articleRepository;
    this.pageRepository = pageRepository;
    this.productRepository = productRepository;
    this.serviceRepository = serviceRepository;
  }

  /**
   * Generate sitemap.xml
   */
  async generateSitemap(baseUrl) {
    const articles = await this.articleRepository.findAll(1000, 0);
    const pages = await this.pageRepository.findAll();

    const urls = [
      { loc: baseUrl, priority: '1.0', changefreq: 'weekly' },
    ];

    if (isEnabled('FEATURE_SECTION_BLOG')) {
      urls.push({ loc: `${baseUrl}/blog`, priority: '0.8', changefreq: 'daily' });
    }

    // Add published pages (findAll already filters published = TRUE)
    pages.forEach(page => {
      urls.push({
        loc: `${baseUrl}/${page.slug}`,
        priority: '0.7',
        changefreq: 'weekly',
        lastmod: page.updated_at
      });
    });

    // Add published articles (findAll already filters published = TRUE)
    articles.forEach(article => {
      urls.push({
        loc: `${baseUrl}/blog/${article.slug}`,
        priority: '0.6',
        changefreq: 'monthly',
        lastmod: article.updated_at || article.published_at || article.created_at
      });
    });

    // Add active shop products
    if (isEnabled('FEATURE_SECTION_SHOP') && this.productRepository) {
      const products = await this.productRepository.findAll({ activeOnly: true });
      products.forEach(product => {
        urls.push({
          loc: `${baseUrl}/boutique/${product.slug}`,
          priority: '0.7',
          changefreq: 'weekly',
          lastmod: product.updated_at
        });
      });
    }

    // Add active appointment services (they're listed on /rdv, no individual pages yet)
    if (isEnabled('FEATURE_SECTION_APPOINTMENTS')) {
      urls.push({ loc: `${baseUrl}/rdv`, priority: '0.7', changefreq: 'weekly' });
    }

    return this.buildSitemapXML(urls);
  }

  buildSitemapXML(urls) {
    const escapeXml = (str) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const urlElements = urls.map(url => {
      const lastmod = url.lastmod ? `\n    <lastmod>${escapeXml(String(url.lastmod))}</lastmod>` : '';
      const changefreq = url.changefreq ? `\n    <changefreq>${escapeXml(url.changefreq)}</changefreq>` : '';
      return `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <priority>${escapeXml(String(url.priority))}</priority>${lastmod}${changefreq}
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
