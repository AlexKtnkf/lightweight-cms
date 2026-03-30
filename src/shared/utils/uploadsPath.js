const path = require('path');

const uploadsRoot = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, '../../../public/uploads');

function normalizeStoredMediaPath(mediaPath) {
  return String(mediaPath || '')
    .replace(/^\/+/, '')
    .replace(/^uploads[\\/]/, '');
}

function resolveMediaFilePath(mediaPath) {
  return path.join(uploadsRoot, normalizeStoredMediaPath(mediaPath));
}

module.exports = {
  uploadsRoot,
  normalizeStoredMediaPath,
  resolveMediaFilePath
};
