const db = require('../../../../infrastructure/database/database');
const slugify = require('../../../../shared/utils/slugify');

class ServiceRepository {
  async findAll({ activeOnly = false } = {}) {
    const where = activeOnly ? 'WHERE active = TRUE' : '';
    return db.all(`SELECT * FROM appointment_services ${where} ORDER BY name ASC`);
  }

  async findById(id) {
    return db.get('SELECT * FROM appointment_services WHERE id = ?', [id]);
  }

  async findBySlug(slug) {
    return db.get('SELECT * FROM appointment_services WHERE slug = ?', [slug]);
  }

  async create(data) {
    const slug = data.slug || slugify(data.name);
    const sql = `INSERT INTO appointment_services
      (name, slug, description, duration_min, price, currency, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING id`;
    const result = await db.run(sql, [
      data.name,
      slug,
      data.description || null,
      data.duration_min || 60,
      data.price ?? null,
      data.currency || 'EUR',
      data.active !== false
    ]);
    return this.findById(result.lastID);
  }

  async update(id, data) {
    const current = await this.findById(id);
    if (!current) return null;
    const slug = data.slug || (data.name ? slugify(data.name) : current.slug);
    await db.run(
      `UPDATE appointment_services SET
        name = ?, slug = ?, description = ?, duration_min = ?, price = ?,
        currency = ?, active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      [
        data.name ?? current.name,
        slug,
        data.description !== undefined ? data.description : current.description,
        data.duration_min ?? current.duration_min,
        data.price !== undefined ? data.price : current.price,
        data.currency ?? current.currency,
        data.active !== undefined ? data.active : current.active,
        id
      ]
    );
    return this.findById(id);
  }

  async delete(id) {
    await db.run('DELETE FROM appointment_services WHERE id = ?', [id]);
  }
}

module.exports = new ServiceRepository();
