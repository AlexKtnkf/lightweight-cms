class ListPublishedArticles {
  constructor(articleRepository) {
    this.articleRepository = articleRepository;
  }

  async execute(options = {}) {
    const { limit = 50, offset = 0 } = options;
    return await this.articleRepository.findAll(limit, offset);
  }
}

module.exports = ListPublishedArticles;
