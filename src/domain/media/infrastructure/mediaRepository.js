const db = require('../../../infrastructure/database/database');

class MediaRepository {
  // Find by ID
  async findById(id) {
    const sql = `SELECT * FROM media WHERE id = ?`;
    return db.get(sql, [id]);
  }

  // Find all media (with pagination)
  async findAll(limit = 50, offset = 0) {
    const sql = `SELECT * FROM media 
                 ORDER BY uploaded_at DESC
                 LIMIT ? OFFSET ?`;
    return db.all(sql, [limit, offset]);
  }

  // Find by filename
  async findByFilename(filename) {
    const sql = `SELECT * FROM media WHERE filename = ?`;
    return db.get(sql, [filename]);
  }

  // Create
  async create(mediaData) {
    const sql = `INSERT INTO media (filename, original_filename, path, mime_type, file_size, width, height, thumbnail_path, webp_path, uploaded_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;
    const result = await db.run(sql, [
      mediaData.filename,
      mediaData.original_filename,
      mediaData.path,
      mediaData.mime_type,
      mediaData.file_size,
      mediaData.width || null,
      mediaData.height || null,
      mediaData.thumbnail_path || null,
      mediaData.webp_path || null
    ]);
    return this.findById(result.lastID);
  }

  // Delete
  async delete(id) {
    const sql = `DELETE FROM media WHERE id = ?`;
    await db.run(sql, [id]);
  }

  // Count total media
  async count() {
    const sql = `SELECT COUNT(*) as count FROM media`;
    const result = await db.get(sql);
    return result.count;
  }
}

module.exports = new MediaRepository();
