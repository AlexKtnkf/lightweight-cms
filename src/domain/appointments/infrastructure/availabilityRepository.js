const db = require('../../../../infrastructure/database/database');

class AvailabilityRepository {
  async findAll({ activeOnly = false } = {}) {
    const where = activeOnly ? 'WHERE active = TRUE' : '';
    return db.all(`SELECT * FROM appointment_availability ${where} ORDER BY weekday ASC, start_time ASC`);
  }

  async create(data) {
    const sql = `INSERT INTO appointment_availability
      (weekday, start_time, end_time, active)
      VALUES (?, ?, ?, ?)
      RETURNING id`;
    const result = await db.run(sql, [
      data.weekday,
      data.start_time,
      data.end_time,
      data.active !== false
    ]);
    return db.get('SELECT * FROM appointment_availability WHERE id = ?', [result.lastID]);
  }

  async update(id, data) {
    const current = await db.get('SELECT * FROM appointment_availability WHERE id = ?', [id]);
    if (!current) return null;
    await db.run(
      `UPDATE appointment_availability SET
        weekday = ?, start_time = ?, end_time = ?, active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      [
        data.weekday ?? current.weekday,
        data.start_time ?? current.start_time,
        data.end_time ?? current.end_time,
        data.active !== undefined ? data.active : current.active,
        id
      ]
    );
    return db.get('SELECT * FROM appointment_availability WHERE id = ?', [id]);
  }

  async delete(id) {
    await db.run('DELETE FROM appointment_availability WHERE id = ?', [id]);
  }
}

module.exports = new AvailabilityRepository();
