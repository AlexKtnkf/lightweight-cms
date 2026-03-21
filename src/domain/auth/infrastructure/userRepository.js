const db = require('../../../infrastructure/database/database');

class UserRepository {
  // Find by ID
  async findById(id) {
    const sql = `SELECT id, username, created_at, last_login FROM users WHERE id = ?`;
    return db.get(sql, [id]);
  }

  // Find by username
  async findByUsername(username) {
    const sql = `SELECT * FROM users WHERE username = ?`;
    return db.get(sql, [username]);
  }

  // Create user
  async create(userData) {
    const sql = `INSERT INTO users (username, password_hash, created_at)
                 VALUES (?, ?, CURRENT_TIMESTAMP)`;
    const result = await db.run(sql, [
      userData.username,
      userData.password_hash
    ]);
    return this.findById(result.lastID);
  }

  // Update last login
  async updateLastLogin(id) {
    const sql = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
    await db.run(sql, [id]);
  }

  // Update password
  async updatePassword(id, passwordHash) {
    const sql = `UPDATE users SET password_hash = ? WHERE id = ?`;
    await db.run(sql, [passwordHash, id]);
  }
}

module.exports = new UserRepository();
