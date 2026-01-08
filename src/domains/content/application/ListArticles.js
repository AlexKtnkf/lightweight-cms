class ListArticles {
  constructor(articleRepository) {
    this.articleRepository = articleRepository;
  }

  async execute(options = {}) {
    const { limit = 50, offset = 0 } = options;
    const articles = await this.articleRepository.findAllAdmin(limit, offset);
    return articles;
  }
}

module.exports = ListArticles;
