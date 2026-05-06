const StorageAdapter = require('./StorageAdapter');
const { processImage, deleteImage } = require('../../../../utils/imageOptimizer');

/**
 * LocalStorageAdapter — stores image files on the local filesystem.
 * Delegates to the existing imageOptimizer utility.
 */
class LocalStorageAdapter extends StorageAdapter {
  async upload(file) {
    const result = await processImage(file);
    return {
      ...result,
      src: null // local storage; public URL is derived from path
    };
  }

  async delete(media) {
    await deleteImage(media.path);
  }
}

module.exports = LocalStorageAdapter;
