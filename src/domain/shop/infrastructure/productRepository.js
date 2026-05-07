const db = require('../../../infrastructure/database/database');
const slugify = require('../../../shared/utils/slugify');

class ProductRepository {
  async findAll({ activeOnly = false } = {}) {
    const where = activeOnly ? 'WHERE active = TRUE' : '';
    return db.all(
      `SELECT p.*, COALESCE(m.src, m.path) AS image_url
       FROM products p
       LEFT JOIN media m ON m.id = p.image_media_id
       ${where.replace('active', 'p.active')}
       ORDER BY p.created_at DESC`
    );
  }

  async findById(id) {
    return db.get(
      `SELECT p.*, COALESCE(m.src, m.path) AS image_url
       FROM products p
       LEFT JOIN media m ON m.id = p.image_media_id
       WHERE p.id = ?`,
      [id]
    );
  }

  async findBySlug(slug) {
    return db.get(
      `SELECT p.*, COALESCE(m.src, m.path) AS image_url
       FROM products p
       LEFT JOIN media m ON m.id = p.image_media_id
       WHERE p.slug = ?`,
      [slug]
    );
  }

  async create(data) {
    const slug = data.slug || slugify(data.name);
    const sql = `INSERT INTO products
      (name, slug, description, price, currency, image_media_id, stock, active, stripe_price_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id`;
    const result = await db.run(sql, [
      data.name,
      slug,
      data.description || null,
      data.price,
      data.currency || 'EUR',
      data.image_media_id || null,
      data.stock ?? null,
      data.active !== false,
      data.stripe_price_id || null
    ]);
    return this.findById(result.lastID);
  }

  async update(id, data) {
    const product = await this.findById(id);
    if (!product) return null;
    const slug = data.slug || (data.name ? slugify(data.name) : product.slug);
    const sql = `UPDATE products SET
      name = ?, slug = ?, description = ?, price = ?, currency = ?,
      image_media_id = ?, stock = ?, active = ?, stripe_price_id = ?,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`;
    await db.run(sql, [
      data.name ?? product.name,
      slug,
      data.description !== undefined ? data.description : product.description,
      data.price ?? product.price,
      data.currency ?? product.currency,
      data.image_media_id !== undefined ? data.image_media_id : product.image_media_id,
      data.stock !== undefined ? data.stock : product.stock,
      data.active !== undefined ? data.active : product.active,
      data.stripe_price_id !== undefined ? data.stripe_price_id : product.stripe_price_id,
      id
    ]);
    return this.findById(id);
  }

  async delete(id) {
    await db.run('DELETE FROM products WHERE id = ?', [id]);
  }

  /**
   * Atomically decrement stock by `qty` for a product.
   * Only decrements when stock is not NULL (NULL = unlimited).
   * Stock floor is 0 — will not go negative.
   */
  async decrementStock(id, qty = 1) {
    await db.run(
      `UPDATE products
       SET stock = GREATEST(stock - ?, 0), updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND stock IS NOT NULL`,
      [qty, id]
    );
  }
}

module.exports = new ProductRepository();
