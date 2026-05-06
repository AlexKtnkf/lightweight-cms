const path = require('path');

class UploadMedia {
  constructor(mediaRepository, storageAdapter) {
    this.mediaRepository = mediaRepository;
    this.storageAdapter = storageAdapter;
  }

  async execute(file) {
    if (!file) {
      const error = new Error('Aucun fichier téléchargé');
      error.status = 400;
      throw error;
    }

    // Process image and store via configured adapter
    const processed = await this.storageAdapter.upload(file);

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
      webp_path: processed.webpPath,
      src: processed.src || null
    };

    return this.mediaRepository.create(mediaData);
  }
}

module.exports = UploadMedia;
