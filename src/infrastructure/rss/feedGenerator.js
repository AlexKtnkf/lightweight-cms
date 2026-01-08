const RSS = require('rss');
const articleRepository = require('../../domains/content/infrastructure/articleRepository');
const settingsRepository = require('../../domains/settings/infrastructure/settingsRepository');

class FeedGenerator {
  constructor(articleRepository, settingsRepository) {
    this.articleRepository = articleRepository;
    this.settingsRepository = settingsRepository;
  }

  async generateFeed(baseUrl) {
    const settings = await this.settingsRepository.get();
    const siteTitle = settings.site_title || 'My Site';
    const siteDescription = settings.site_tagline || '';
    const articles = await this.articleRepository.findAll(50, 0);

    const feed = new RSS({
      title: siteTitle,
      description: siteDescription,
      feed_url: `${baseUrl}/feed.xml`,
      site_url: baseUrl,
      language: 'fr',
      pubDate: articles.length > 0 ? articles[0].published_at : new Date()
    });

    articles.forEach(article => {
      feed.item({
        title: article.title,
        description: article.meta_description || '',
        url: `${baseUrl}/blog/${article.slug}`,
        guid: `${baseUrl}/blog/${article.slug}`,
        date: article.published_at || article.created_at
      });
    });

    return feed.xml({ indent: true });
  }
}

module.exports = FeedGenerator;
