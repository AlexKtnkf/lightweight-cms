class ArticlesController {
  constructor(createArticle, updateArticle, deleteArticle, getArticle, listArticles) {
    this.createArticle = createArticle;
    this.updateArticle = updateArticle;
    this.deleteArticle = deleteArticle;
    this.getArticle = getArticle;
    this.listArticles = listArticles;
  }

  async create(req, res, next) {
    try {
      const article = await this.createArticle.execute(req.body);
      res.status(201).json(article);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const article = await this.updateArticle.execute(parseInt(id), req.body);
      res.json(article);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const { id } = req.params;
      const article = await this.getArticle.execute(parseInt(id));
      res.json(article);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const articles = await this.listArticles.execute({ limit, offset });
      res.json(articles);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await this.deleteArticle.execute(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ArticlesController;
