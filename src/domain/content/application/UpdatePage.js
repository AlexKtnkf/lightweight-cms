const Page = require('../domain/Page');
const { prepareBlocksForCreation } = require('../../../shared/utils/blockSanitizer');

class UpdatePage {
  constructor(pageRepository, blockRepository, staticGenerator) {
    this.pageRepository = pageRepository;
    this.blockRepository = blockRepository;
    this.staticGenerator = staticGenerator;
  }

  async execute(id, pageData) {
    // Load existing page
    const existing = await this.pageRepository.findById(id);
    if (!existing) {
      const error = new Error('Page introuvable');
      error.status = 404;
      throw error;
    }

    // Create domain model with updates
    const page = Page.fromJSON({
      ...existing,
      ...pageData,
      id, // Ensure ID doesn't change
    });

    // Validate
    page.validate();

    // Persist
    const savedPageData = await this.pageRepository.update(id, page.toJSON());
    const savedPage = Page.fromJSON(savedPageData);
    const previousSlug = existing.slug;
    const currentSlug = savedPage.slug?.toString();

    // Update blocks
    if (pageData.blocks !== undefined) {
      await this.blockRepository.deleteByContent('page', id);
      if (page.blocks.length > 0) {
        const preparedBlocks = prepareBlocksForCreation(page.blocks);
        const blocksToCreate = preparedBlocks.map(block => ({
          content_type: 'page',
          content_id: id,
          ...block
        }));
        await this.blockRepository.createMany(blocksToCreate);
      }
      // Reload with blocks
      const blocks = await this.blockRepository.findByContent('page', id);
      savedPage.blocks = this.blockRepository.parseBlocks(blocks);
    }

    // Keep the static copy aligned with slug and publish-state changes
    if (savedPage.id === 1) {
      await this.staticGenerator.generateHomepage();
    } else {
      if (savedPage.published) {
        await this.staticGenerator.generatePage(savedPage.toJSON());
        if (previousSlug && previousSlug !== currentSlug) {
          await this.staticGenerator.deletePage(previousSlug);
        }
      } else if (currentSlug) {
        if (previousSlug && previousSlug !== currentSlug) {
          await this.staticGenerator.deletePage(previousSlug);
        }
        await this.staticGenerator.deletePage(currentSlug);
      }
    }

    return savedPage.toJSON();
  }
}

module.exports = UpdatePage;
