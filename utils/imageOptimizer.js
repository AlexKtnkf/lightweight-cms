const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

const MAX_WIDTH = 1920;
const THUMBNAIL_WIDTH = 300;
const UPLOADS_DIR = path.join(__dirname, '../public/uploads/images');

/**
 * Ensure uploads directory exists
 */
async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
      } catch (error) {
        logger.error('Error creating uploads directory:', error);
        throw error;
      }
}

/**
 * Process and optimize an uploaded image
 * Returns object with paths to original, thumbnail, and WebP versions
 */
async function processImage(file) {
  await ensureUploadsDir();
  
  const ext = path.extname(file.originalname).toLowerCase();
  const baseFilename = uuidv4();
  const originalPath = path.join(UPLOADS_DIR, `${baseFilename}${ext}`);
  const thumbnailPath = path.join(UPLOADS_DIR, `${baseFilename}_thumb${ext}`);
  const webpPath = path.join(UPLOADS_DIR, `${baseFilename}.webp`);
  const thumbnailWebpPath = path.join(UPLOADS_DIR, `${baseFilename}_thumb.webp`);

  // Save original file
  await fs.writeFile(originalPath, file.buffer);

  // Get image metadata
  const metadata = await sharp(file.buffer).metadata();
  let width = metadata.width;
  let height = metadata.height;

  // Resize if too large
  let processedImage = sharp(file.buffer);
  if (width > MAX_WIDTH) {
    processedImage = processedImage.resize(MAX_WIDTH, null, {
      withoutEnlargement: true,
      fit: 'inside'
    });
    const resizedMetadata = await processedImage.metadata();
    width = resizedMetadata.width;
    height = resizedMetadata.height;
  }

  // Save resized original (if needed)
  if (width !== metadata.width) {
    await processedImage.toFile(originalPath);
  }

  // Generate thumbnail
  await sharp(file.buffer)
    .resize(THUMBNAIL_WIDTH, null, {
      withoutEnlargement: true,
      fit: 'inside'
    })
    .toFile(thumbnailPath);

  // Generate WebP versions
  await processedImage
    .webp({ quality: 85 })
    .toFile(webpPath);

  await sharp(file.buffer)
    .resize(THUMBNAIL_WIDTH, null, {
      withoutEnlargement: true,
      fit: 'inside'
    })
    .webp({ quality: 85 })
    .toFile(thumbnailWebpPath);

  return {
    originalPath: `/uploads/images/${baseFilename}${ext}`,
    thumbnailPath: `/uploads/images/${baseFilename}_thumb${ext}`,
    webpPath: `/uploads/images/${baseFilename}.webp`,
    thumbnailWebpPath: `/uploads/images/${baseFilename}_thumb.webp`,
    width,
    height,
    fileSize: file.size
  };
}

/**
 * Delete image files (original, thumbnail, WebP versions)
 */
async function deleteImage(mediaPath) {
  try {
    const basePath = path.join(__dirname, '../public', mediaPath);
    const ext = path.extname(basePath);
    const baseName = path.basename(basePath, ext);
    const dir = path.dirname(basePath);

    const filesToDelete = [
      basePath, // original
      path.join(dir, `${baseName}_thumb${ext}`), // thumbnail
      path.join(dir, `${baseName}.webp`), // webp
      path.join(dir, `${baseName}_thumb.webp`) // thumbnail webp
    ];

    for (const file of filesToDelete) {
      try {
        await fs.unlink(file);
      } catch (err) {
        // File might not exist, ignore
      }
    }
  } catch (error) {
    logger.error('Error deleting image files:', error);
    throw error;
  }
}

module.exports = {
  processImage,
  deleteImage,
  ensureUploadsDir
};
