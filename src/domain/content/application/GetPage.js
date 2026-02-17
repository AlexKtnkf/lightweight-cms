const Page = require('../domain/Page');

class GetPage {
  constructor(pageRepository, blockRepository) {
    this.pageRepository = pageRepository;
    this.blockRepository = blockRepository;
  }

  async execute(id) {
    const pageData = await this.pageRepository.findById(id);
    if (!pageData) {
      const error = new Error('Page not found');
      error.status = 404;
      throw error;
    }

    // Load blocks
    const blocks = await this.blockRepository.findByContent('page', id);
    const parsedBlocks = this.blockRepository.parseBlocks(blocks);
    
    const page = Page.fromJSON({
      ...pageData,
      blocks: parsedBlocks,
    });

    return page.toJSON();
  }
}

module.exports = GetPage;
