const path = require('path');
const sharp = require('sharp');

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

    // Verify actual image bytes regardless of the client-supplied MIME type.
    // sharp.metadata() decodes the file header and throws for non-image data.
    try {
      await sharp(file.buffer).metadata();
    } catch {
      const error = new Error('Fichier invalide : le contenu ne correspond pas à une image');
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
