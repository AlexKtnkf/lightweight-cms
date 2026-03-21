const db = require('../../../infrastructure/database/database');

class ArticleRepository {
  // Find by ID
  async findById(id) {
    const sql = `SELECT * FROM articles WHERE id = ?`;
    return db.get(sql, [id]);
  }

  // Find by slug (published only)
  async findBySlug(slug) {
    const sql = `SELECT * FROM articles WHERE slug = ? AND published = TRUE`;
    return db.get(sql, [slug]);
  }

  // Find by slug (any status, for admin)
  async findBySlugAdmin(slug) {
    const sql = `SELECT * FROM articles WHERE slug = ?`;
    return db.get(sql, [slug]);
  }

  // List all published (with pagination)
  async findAll(limit = 50, offset = 0) {
    const sql = `SELECT * FROM articles 
                 WHERE published = TRUE 
                 ORDER BY published_at DESC, created_at DESC
                 LIMIT ? OFFSET ?`;
    return db.all(sql, [limit, offset]);
  }

  // List all (for admin)
  async findAllAdmin(limit = 50, offset = 0) {
    const sql = `SELECT * FROM articles 
                 ORDER BY created_at DESC
                 LIMIT ? OFFSET ?`;
    return db.all(sql, [limit, offset]);
  }

  // Count published articles
  async count() {
    const sql = `SELECT COUNT(*) as count FROM articles WHERE published = TRUE`;
    const result = await db.get(sql);
    return result.count;
  }

  // Create
  async create(articleData) {
    const sql = `INSERT INTO articles (title, slug, published_at, published, meta_title, meta_description, og_title, og_description, og_image_id, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
    const result = await db.run(sql, [
      articleData.title,
      articleData.slug,
      articleData.published_at || null,
      articleData.published || false,
      articleData.meta_title || null,
      articleData.meta_description || null,
      articleData.og_title || null,
      articleData.og_description || null,
      articleData.og_image_id || null
    ]);
    return this.findById(result.lastID);
  }

  // Update
  async update(id, articleData) {
    const sql = `UPDATE articles 
                 SET title = ?, slug = ?, published_at = ?, published = ?, 
                     meta_title = ?, meta_description = ?, og_title = ?, og_description = ?, og_image_id = ?,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;
    await db.run(sql, [
      articleData.title,
      articleData.slug,
      articleData.published_at || null,
      articleData.published || false,
      articleData.meta_title || null,
      articleData.meta_description || null,
      articleData.og_title || null,
      articleData.og_description || null,
      articleData.og_image_id || null,
      id
    ]);
    return this.findById(id);
  }

  // Delete
  async delete(id) {
    const sql = `DELETE FROM articles WHERE id = ?`;
    await db.run(sql, [id]);
  }
}

module.exports = new ArticleRepository();
