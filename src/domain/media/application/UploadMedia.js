const mediaRepository = require('../infrastructure/mediaRepository');
const { processImage } = require('../../../../utils/imageOptimizer');
const path = require('path');

class UploadMedia {
  constructor(mediaRepository) {
    this.mediaRepository = mediaRepository;
  }

  async execute(file) {
    if (!file) {
      const error = new Error('Aucun fichier téléchargé');
      error.status = 400;
      throw error;
    }

    // Process image (resize, generate thumbnails, WebP)
    const processed = await processImage(file);

    // Create media entry
    const mediaData = {
      filename: path.basename(processed.originalPath),
      original_filename: file.originalname,
      path: processed.originalPath,
      mime_type: file.mimetype,
      file_size: processed.fileSize,
      width: processed.width,
      height: processed.height,
      thumbnail_path: processed.thumbnailPath,
      webp_path: processed.webpPath
    };

    return this.mediaRepository.create(mediaData);
  }
}

module.exports = UploadMedia;
