/**
 * Contact Submissions Repository
 * Handles database operations for contact form submissions
 */

const db = require('../../../infrastructure/database/database');

class ContactSubmissionRepository {
  /**
   * Create a new contact submission
   * @param {Object} submission - { form_data, visitor_email, visitor_ip }
   */
  async create(submission) {
    const sql = `
      INSERT INTO contact_submissions 
        (form_data, visitor_email, visitor_ip, submitted_at)
      VALUES (?, ?, ?, datetime('now'))
    `;

    const result = await db.run(sql, [
      typeof submission.form_data === 'string' ? submission.form_data : JSON.stringify(submission.form_data),
      submission.visitor_email || null,
      submission.visitor_ip || null,
    ]);

    return { id: result.lastID, ...submission };
  }

  /**
   * Find all submissions with pagination
   * @param {number} limit - Number of records
   * @param {number} offset - Pagination offset
   * @param {Object} filters - { read, archived }
   */
  async findAll(limit = 50, offset = 0, filters = {}) {
    let sql = 'SELECT * FROM contact_submissions WHERE 1=1';
    const params = [];

    if (filters.read !== undefined) {
      sql += ' AND read = ?';
      params.push(filters.read ? 1 : 0);
    }

    if (filters.archived !== undefined) {
      sql += ' AND archived = ?';
      params.push(filters.archived ? 1 : 0);
    }

    sql += ' ORDER BY submitted_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await db.all(sql, params);
    return rows.map(row => this.parseRow(row));
  }

  /**
   * Find submission by ID
   */
  async findById(id) {
    const sql = 'SELECT * FROM contact_submissions WHERE id = ?';
    const row = await db.get(sql, [id]);
    return row ? this.parseRow(row) : null;
  }

  /**
   * Count total submissions
   */
  async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as count FROM contact_submissions WHERE 1=1';
    const params = [];

    if (filters.read !== undefined) {
      sql += ' AND read = ?';
      params.push(filters.read ? 1 : 0);
    }

    if (filters.archived !== undefined) {
      sql += ' AND archived = ?';
      params.push(filters.archived ? 1 : 0);
    }

    const result = await db.get(sql, params);
    return result.count;
  }

  /**
   * Mark submission as read
   */
  async markAsRead(id) {
    const sql = 'UPDATE contact_submissions SET read = 1 WHERE id = ?';
    await db.run(sql, [id]);
  }

  /**
   * Update submission notes
   */
  async updateNotes(id, notes) {
    const sql = 'UPDATE contact_submissions SET notes = ?, responded_at = datetime("now") WHERE id = ?';
    await db.run(sql, [notes, id]);
  }

  /**
   * Soft delete submission
   */
  async archive(id) {
    const sql = 'UPDATE contact_submissions SET archived = 1 WHERE id = ?';
    await db.run(sql, [id]);
  }

  /**
   * Get unread count
   */
  async getUnreadCount() {
    const sql = 'SELECT COUNT(*) as count FROM contact_submissions WHERE read = 0 AND archived = 0';
    const result = await db.get(sql);
    return result.count;
  }

  /**
   * Clean up old archived submissions (optional maintenance)
   * @param {number} daysOld - Delete submissions older than this many days
   */
  async deleteOldArchived(daysOld = 90) {
    const sql = `
      DELETE FROM contact_submissions 
      WHERE archived = 1 
        AND submitted_at < datetime('now', '-' || ? || ' days')
    `;
    const result = await db.run(sql, [daysOld]);
    return result.changes;
  }

  /**
   * Parse database row
   */
  parseRow(row) {
    return {
      id: row.id,
      form_data: typeof row.form_data === 'string' ? JSON.parse(row.form_data) : row.form_data,
      visitor_email: row.visitor_email,
      visitor_ip: row.visitor_ip,
      submitted_at: row.submitted_at,
      read: Boolean(row.read),
      responded_at: row.responded_at,
      notes: row.notes,
      archived: Boolean(row.archived),
    };
  }
}

module.exports = ContactSubmissionRepository;
