class PagesController {
  constructor(createPage, updatePage, deletePage, getPage, listPages) {
    this.createPage = createPage;
    this.updatePage = updatePage;
    this.deletePage = deletePage;
    this.getPage = getPage;
    this.listPages = listPages;
  }

  async create(req, res, next) {
    try {
      const page = await this.createPage.execute(req.body);
      res.status(201).json(page);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const page = await this.updatePage.execute(parseInt(id), req.body);
      res.json(page);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const { id } = req.params;
      const page = await this.getPage.execute(parseInt(id));
      res.json(page);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const pages = await this.listPages.execute({ limit, offset });
      res.json(pages);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await this.deletePage.execute(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PagesController;
