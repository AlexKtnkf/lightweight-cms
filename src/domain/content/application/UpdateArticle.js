const Article = require('../domain/Article');
const { prepareBlocksForCreation } = require('../../../shared/utils/blockSanitizer');
const db = require('../../../infrastructure/database/database');

class UpdateArticle {
  constructor(articleRepository, blockRepository) {
    this.articleRepository = articleRepository;
    this.blockRepository = blockRepository;
  }

  async execute(id, articleData) {
    // Load existing article
    const existing = await this.articleRepository.findById(id);
    if (!existing) {
      const error = new Error('Article introuvable');
      error.status = 404;
      throw error;
    }

    // Create domain model with updates
    const article = Article.fromJSON({
      ...existing,
      ...articleData,
      id, // Ensure ID doesn't change
    });

    // Validate
    article.validate();

    // Persist article and blocks in a single transaction
    return db.transaction(async () => {
      const savedArticleData = await this.articleRepository.update(id, article.toJSON());
      const savedArticle = Article.fromJSON(savedArticleData);

      if (articleData.blocks !== undefined) {
        await this.blockRepository.deleteByContent('article', id);
        if (article.blocks.length > 0) {
          const preparedBlocks = prepareBlocksForCreation(article.blocks);
          const blocksToCreate = preparedBlocks.map(block => ({
            content_type: 'article',
            content_id: id,
            ...block
          }));
          await this.blockRepository.createMany(blocksToCreate);
        }
        const blocks = await this.blockRepository.findByContent('article', id);
        savedArticle.blocks = this.blockRepository.parseBlocks(blocks);
      }

      return savedArticle.toJSON();
    });
  }
}

module.exports = UpdateArticle;
