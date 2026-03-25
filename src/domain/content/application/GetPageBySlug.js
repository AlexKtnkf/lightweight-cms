const Page = require('../domain/Page');

class GetPageBySlug {
  constructor(pageRepository, blockRepository) {
    this.pageRepository = pageRepository;
    this.blockRepository = blockRepository;
  }

  async execute(slug, admin = false) {
    const pageData = admin 
      ? await this.pageRepository.findBySlugAdmin(slug)
      : await this.pageRepository.findBySlug(slug);
    
    if (!pageData) {
      const error = new Error('Page introuvable');
      error.status = 404;
      throw error;
    }

    // Load blocks
    const blocks = await this.blockRepository.findByContent('page', pageData.id);
    const parsedBlocks = this.blockRepository.parseBlocks(blocks);
    
    const page = Page.fromJSON({
      ...pageData,
      blocks: parsedBlocks,
    });

    return page.toJSON();
  }
}

module.exports = GetPageBySlug;
