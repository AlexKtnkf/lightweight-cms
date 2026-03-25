const db = require('../../../infrastructure/database/database');

class PageRepository {
  // Find by ID
  async findById(id) {
    const sql = `SELECT * FROM pages WHERE id = ?`;
    return db.get(sql, [id]);
  }

  // Find by slug (published only)
  async findBySlug(slug) {
    const sql = `SELECT * FROM pages WHERE slug = ? AND published = TRUE`;
    return db.get(sql, [slug]);
  }

  // Find by slug (any status, for admin)
  async findBySlugAdmin(slug) {
    const sql = `SELECT * FROM pages WHERE slug = ?`;
    return db.get(sql, [slug]);
  }

  // List all published (for navigation)
  async findAll() {
    const sql = `SELECT id, title, slug FROM pages 
                 WHERE published = TRUE 
                 ORDER BY title ASC`;
    return db.all(sql);
  }

  // List all (for admin) - optionally exclude homepage (id = 1)
  async findAllAdmin(limit = 50, offset = 0, excludeHomepage = false) {
    const where = excludeHomepage ? 'WHERE id != 1' : '';
    const sql = `SELECT * FROM pages 
                 ${where}
                 ORDER BY created_at DESC
                 LIMIT ? OFFSET ?`;
    return db.all(sql, [limit, offset]);
  }

  // Create
  async create(pageData) {
    // Allow setting specific ID for homepage (id = 1)
    const sql = pageData.id 
      ? `INSERT INTO pages (id, title, slug, published, image_media_id, meta_title, meta_description, og_title, og_description, og_image_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`
      : `INSERT INTO pages (title, slug, published, image_media_id, meta_title, meta_description, og_title, og_description, og_image_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`;
    
    const params = pageData.id
      ? [
          pageData.id,
          pageData.title,
          pageData.slug,
          pageData.published || false,
          pageData.image_media_id || null,
          pageData.meta_title || null,
          pageData.meta_description || null,
          pageData.og_title || null,
          pageData.og_description || null,
          pageData.og_image_id || null
        ]
      : [
          pageData.title,
          pageData.slug,
          pageData.published || false,
          pageData.image_media_id || null,
          pageData.meta_title || null,
          pageData.meta_description || null,
          pageData.og_title || null,
          pageData.og_description || null,
          pageData.og_image_id || null
        ];
    
    const result = await db.run(sql, params);
    return this.findById(pageData.id || result.lastID);
  }

  // Update
  async update(id, pageData) {
    const sql = `UPDATE pages 
                 SET title = ?, slug = ?, published = ?, image_media_id = ?,
                     meta_title = ?, meta_description = ?, og_title = ?, og_description = ?, og_image_id = ?,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;
    await db.run(sql, [
      pageData.title,
      pageData.slug,
      pageData.published || false,
      pageData.image_media_id || null,
      pageData.meta_title || null,
      pageData.meta_description || null,
      pageData.og_title || null,
      pageData.og_description || null,
      pageData.og_image_id || null,
      id
    ]);
    return this.findById(id);
  }

  // Delete
  async delete(id) {
    const sql = `DELETE FROM pages WHERE id = ?`;
    await db.run(sql, [id]);
  }
}

module.exports = new PageRepository();
