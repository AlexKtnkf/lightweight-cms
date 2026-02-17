const Article = require('../domain/Article');

class GetArticleBySlug {
  constructor(articleRepository, blockRepository) {
    this.articleRepository = articleRepository;
    this.blockRepository = blockRepository;
  }

  async execute(slug, admin = false) {
    const articleData = admin 
      ? await this.articleRepository.findBySlugAdmin(slug)
      : await this.articleRepository.findBySlug(slug);
    
    if (!articleData) {
      const error = new Error('Article not found');
      error.status = 404;
      throw error;
    }

    // Load blocks
    const blocks = await this.blockRepository.findByContent('article', articleData.id);
    const parsedBlocks = this.blockRepository.parseBlocks(blocks);
    
    const article = Article.fromJSON({
      ...articleData,
      blocks: parsedBlocks,
    });

    return article.toJSON();
  }
}

module.exports = GetArticleBySlug;
