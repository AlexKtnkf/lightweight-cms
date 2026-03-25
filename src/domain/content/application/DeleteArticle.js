class DeleteArticle {
  constructor(articleRepository, blockRepository) {
    this.articleRepository = articleRepository;
    this.blockRepository = blockRepository;
  }

  async execute(id) {
    const article = await this.articleRepository.findById(id);
    if (!article) {
      const error = new Error('Article introuvable');
      error.status = 404;
      throw error;
    }

    // Delete blocks
    await this.blockRepository.deleteByContent('article', id);
    
    // Delete article
    await this.articleRepository.delete(id);
  }
}

module.exports = DeleteArticle;
