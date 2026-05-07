const Page = require('../domain/Page');
const slugify = require('../../../shared/utils/slugify');
const { prepareBlocksForCreation } = require('../../../shared/utils/blockSanitizer');

class CreatePage {
  constructor(pageRepository, blockRepository, staticGenerator, transactionManager) {
    this.pageRepository = pageRepository;
    this.blockRepository = blockRepository;
    this.staticGenerator = staticGenerator;
    this.transactionManager = transactionManager;
  }

  async execute(pageData) {
    // Generate slug if not provided
    const slug = pageData.slug || slugify(pageData.title);
    
    // Check if slug exists (skip for homepage with specific ID)
    if (!pageData.id) {
      const existing = await this.pageRepository.findBySlugAdmin(slug);
      if (existing) {
        const error = new Error('Une page existe déjà avec ce slug');
        error.status = 400;
        throw error;
      }
    }

    // Create domain model
    const page = new Page({
      ...pageData,
      slug,
      blocks: pageData.blocks || [],
    });

    // Validate
    page.validate();

    // Persist page and blocks in a single transaction
    const savedPage = await this.transactionManager.run(async () => {
      const savedPageData = await this.pageRepository.create(page.toJSON());
      const sp = Page.fromJSON(savedPageData);

      if (page.blocks.length > 0) {
        const preparedBlocks = prepareBlocksForCreation(page.blocks);
        const blocksToCreate = preparedBlocks.map(block => ({
          content_type: 'page',
          content_id: sp.id,
          ...block
        }));
        await this.blockRepository.createMany(blocksToCreate);
        const blocks = await this.blockRepository.findByContent('page', sp.id);
        sp.blocks = this.blockRepository.parseBlocks(blocks);
      }

      return sp;
    });

    // Static generation happens outside the transaction (not critical path)
    if (savedPage.id === 1) {
      await this.staticGenerator.generateHomepage();
    } else if (savedPage.published) {
      await this.staticGenerator.generatePage(savedPage.toJSON());
    }

    return savedPage.toJSON();
  }
}

module.exports = CreatePage;
