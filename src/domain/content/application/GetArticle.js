const Article = require('../domain/Article');

class GetArticle {
  constructor(articleRepository, blockRepository) {
    this.articleRepository = articleRepository;
    this.blockRepository = blockRepository;
  }

  async execute(id) {
    const articleData = await this.articleRepository.findById(id);
    if (!articleData) {
      const error = new Error('Article not found');
      error.status = 404;
      throw error;
    }

    // Load blocks
    const blocks = await this.blockRepository.findByContent('article', id);
    const parsedBlocks = this.blockRepository.parseBlocks(blocks);
    
    const article = Article.fromJSON({
      ...articleData,
      blocks: parsedBlocks,
    });

    return article.toJSON();
  }
}

module.exports = GetArticle;
