const mediaRepository = require('../infrastructure/mediaRepository');
const { deleteImage } = require('../../../../utils/imageOptimizer');

class DeleteMedia {
  constructor(mediaRepository) {
    this.mediaRepository = mediaRepository;
  }

  async execute(id) {
    const media = await this.mediaRepository.findById(id);
    if (!media) {
      const error = new Error('Image introuvable');
      error.status = 404;
      throw error;
    }

    // Delete files from filesystem
    await deleteImage(media.path);

    // Delete from database
    await this.mediaRepository.delete(id);
  }
}

module.exports = DeleteMedia;
