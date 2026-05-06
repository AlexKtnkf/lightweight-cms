/**
 * StorageAdapter — interface contract for image storage providers.
 *
 * Concrete implementations: LocalStorageAdapter, ObjectStorageAdapter.
 *
 * @interface
 */
class StorageAdapter {
  /**
   * Process and store an uploaded image file.
   *
   * @param {object} file - Multer file object ({ buffer, mimetype, originalname, size })
   * @returns {Promise<{
   *   originalPath: string,
   *   thumbnailPath: string,
   *   webpPath: string,
   *   thumbnailWebpPath: string,
   *   width: number,
   *   height: number,
   *   fileSize: number,
   *   src: string|null   // full public URL for object storage, null for local
   * }>}
   */
  // eslint-disable-next-line no-unused-vars
  async upload(file) {
    throw new Error('StorageAdapter.upload() not implemented');
  }

  /**
   * Delete all variants of a stored image.
   *
   * @param {object} media - DB media record (path, src, …)
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async delete(media) {
    throw new Error('StorageAdapter.delete() not implemented');
  }
}

module.exports = StorageAdapter;
