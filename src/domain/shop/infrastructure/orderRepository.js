const db = require('../../../../infrastructure/database/database');

class OrderRepository {
  async findAll({ status } = {}) {
    const where = status ? 'WHERE status = ?' : '';
    const params = status ? [status] : [];
    const rows = await db.all(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC`,
      params
    );
    return rows.map(r => this._parse(r));
  }

  async findById(id) {
    const row = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    return row ? this._parse(row) : null;
  }

  async findByStripeSession(sessionId) {
    const row = await db.get('SELECT * FROM orders WHERE stripe_session_id = ?', [sessionId]);
    return row ? this._parse(row) : null;
  }

  async create(data) {
    const sql = `INSERT INTO orders
      (stripe_session_id, stripe_payment_intent, status, customer_email, customer_name,
       line_items, total_amount, currency, shipping_address, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id`;
    const result = await db.run(sql, [
      data.stripe_session_id || null,
      data.stripe_payment_intent || null,
      data.status || 'pending',
      data.customer_email || null,
      data.customer_name || null,
      JSON.stringify(data.line_items || []),
      data.total_amount,
      data.currency || 'EUR',
      data.shipping_address ? JSON.stringify(data.shipping_address) : null,
      data.notes || null
    ]);
    return this.findById(result.lastID);
  }

  async updateStatus(id, status, extra = {}) {
    const fields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [status];
    if (extra.stripe_payment_intent) {
      fields.push('stripe_payment_intent = ?');
      params.push(extra.stripe_payment_intent);
    }
    await db.run(
      `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
      [...params, id]
    );
    return this.findById(id);
  }

  _parse(row) {
    if (!row) return null;
    return {
      ...row,
      line_items: typeof row.line_items === 'string' ? JSON.parse(row.line_items) : (row.line_items || []),
      shipping_address: row.shipping_address
        ? (typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address)
        : null
    };
  }
}

module.exports = new OrderRepository();
