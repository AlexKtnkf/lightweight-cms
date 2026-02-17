const Article = require('../domain/Article');
const slugify = require('../../../shared/utils/slugify');
const { prepareBlocksForCreation } = require('../../../shared/utils/blockSanitizer');

class CreateArticle {
  constructor(articleRepository, blockRepository) {
    this.articleRepository = articleRepository;
    this.blockRepository = blockRepository;
  }

  async execute(articleData) {
    // Generate slug if not provided
    const slug = articleData.slug || slugify(articleData.title);
    
    // Check if slug exists
    const existing = await this.articleRepository.findBySlugAdmin(slug);
    if (existing) {
      const error = new Error('An article with this slug already exists');
      error.status = 400;
      throw error;
    }

    // Create domain model
    const article = new Article({
      ...articleData,
      slug,
      blocks: articleData.blocks || [],
    });

    // Validate
    article.validate();

    // Persist
    const savedArticleData = await this.articleRepository.create(article.toJSON());
    const savedArticle = Article.fromJSON(savedArticleData);

    // Save blocks
    if (article.blocks.length > 0) {
      const preparedBlocks = prepareBlocksForCreation(article.blocks);
      const blocksToCreate = preparedBlocks.map(block => ({
        content_type: 'article',
        content_id: savedArticle.id,
        ...block
      }));
      await this.blockRepository.createMany(blocksToCreate);
      // Reload with blocks
      const blocks = await this.blockRepository.findByContent('article', savedArticle.id);
      savedArticle.blocks = this.blockRepository.parseBlocks(blocks);
    }

    return savedArticle.toJSON();
  }
}

module.exports = CreateArticle;
