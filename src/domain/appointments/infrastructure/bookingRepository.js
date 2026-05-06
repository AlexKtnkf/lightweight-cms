const db = require('../../../infrastructure/database/database');

class BookingRepository {
  async findAll({ status } = {}) {
    const where = status ? 'WHERE a.status = ?' : '';
    const params = status ? [status] : [];
    return db.all(
      `SELECT a.*, s.name as service_name
       FROM appointments a
       LEFT JOIN appointment_services s ON s.id = a.service_id
       ${where}
       ORDER BY a.start_at DESC`,
      params
    );
  }

  async findById(id) {
    return db.get(
      `SELECT a.*, s.name as service_name
       FROM appointments a
       LEFT JOIN appointment_services s ON s.id = a.service_id
       WHERE a.id = ?`,
      [id]
    );
  }

  async findOverlapping(startAt, endAt) {
    return db.all(
      `SELECT * FROM appointments
       WHERE status IN ('pending', 'confirmed')
         AND start_at < ?
         AND end_at > ?`,
      [endAt, startAt]
    );
  }

  async create(data) {
    const sql = `INSERT INTO appointments
      (service_id, status, customer_name, customer_email, customer_phone, start_at, end_at, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id`;
    const result = await db.run(sql, [
      data.service_id || null,
      data.status || 'pending',
      data.customer_name,
      data.customer_email,
      data.customer_phone || null,
      data.start_at,
      data.end_at,
      data.notes || null
    ]);
    return this.findById(result.lastID);
  }

  async updateStatus(id, status) {
    await db.run(
      `UPDATE appointments
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, id]
    );
    return this.findById(id);
  }
}

module.exports = new BookingRepository();
