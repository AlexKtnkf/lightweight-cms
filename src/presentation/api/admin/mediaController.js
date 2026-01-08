const upload = require('../../../../config/upload');

class MediaController {
  constructor(uploadMedia, listMedia, deleteMedia) {
    this.uploadMedia = uploadMedia;
    this.listMedia = listMedia;
    this.deleteMedia = deleteMedia;
  }

  async upload(req, res, next) {
    try {
      const media = await this.uploadMedia.execute(req.file);
      res.status(201).json(media);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const media = await this.listMedia.execute({ limit, offset });
      res.json(media);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await this.deleteMedia.execute(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MediaController;
