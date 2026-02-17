class DeletePage {
  constructor(pageRepository, blockRepository, staticGenerator) {
    this.pageRepository = pageRepository;
    this.blockRepository = blockRepository;
    this.staticGenerator = staticGenerator;
  }

  async execute(id) {
    // Prevent deleting homepage (id = 1)
    if (id === 1) {
      const error = new Error('Cannot delete homepage (page ID 1)');
      error.status = 400;
      throw error;
    }

    // Get page before deletion to get slug for static file cleanup
    const page = await this.pageRepository.findById(id);
    if (!page) {
      const error = new Error('Page not found');
      error.status = 404;
      throw error;
    }

    // Delete blocks
    await this.blockRepository.deleteByContent('page', id);

    // Delete from database
    await this.pageRepository.delete(id);

    // Delete static file if it exists
    if (page.slug) {
      await this.staticGenerator.deletePage(page.slug);
    }
  }
}

module.exports = DeletePage;
