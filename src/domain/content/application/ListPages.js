class ListPages {
  constructor(pageRepository) {
    this.pageRepository = pageRepository;
  }

  async execute(options = {}) {
    const { limit = 50, offset = 0, excludeHomepage = false } = options;
    const pages = await this.pageRepository.findAllAdmin(limit, offset, excludeHomepage);
    return pages;
  }
}

module.exports = ListPages;
