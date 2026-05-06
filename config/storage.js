const LocalStorageAdapter = require('../src/domain/media/infrastructure/LocalStorageAdapter');
const ObjectStorageAdapter = require('../src/domain/media/infrastructure/ObjectStorageAdapter');

/**
 * Returns the appropriate StorageAdapter based on environment variables.
 *
 * Object storage is activated when S3_BUCKET is set.
 * Otherwise local filesystem storage is used.
 */
function createStorageAdapter() {
  if (process.env.S3_BUCKET) {
    return new ObjectStorageAdapter();
  }
  return new LocalStorageAdapter();
}

module.exports = { createStorageAdapter };
