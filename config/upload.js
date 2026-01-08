const multer = require('multer');
const path = require('path');

// Allowed MIME types for images
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Memory storage (we'll process the file before saving)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${ALLOWED_MIME_TYPES.join(', ')} are allowed.`), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

module.exports = upload;
