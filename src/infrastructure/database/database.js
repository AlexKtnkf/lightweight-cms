const Database = require('better-sqlite3');
const path = require('path');
const logger = require('../../../utils/logger');
require('dotenv').config();

class DatabaseWrapper {
  constructor(dbPath) {
    try {
      // better-sqlite3 is synchronous and doesn't take a callback
      this.db = new Database(dbPath);
      this.db.pragma('journal_mode = WAL'); // Enable Write-Ahead Logging for better concurrency
      logger.info('Connected to SQLite database');
    } catch (error) {
      logger.error('Error opening database:', error);
      throw error;
    }
  }

  /**
   * Run a SQL query (INSERT, UPDATE, DELETE)
   * Returns { lastID, changes } wrapped in a Promise for API compatibility
   */
  run(sql, params = []) {
    return Promise.resolve().then(() => {
      try {
        const stmt = this.db.prepare(sql);
        const result = stmt.run(...(Array.isArray(params) ? params : [params]));
        return {
          lastID: result.lastInsertRowid,
          changes: result.changes
        };
      } catch (error) {
        return Promise.reject(error);
      }
    });
  }

  /**
   * Get a single row
   * Returns the row or undefined wrapped in a Promise for API compatibility
   */
  get(sql, params = []) {
    return Promise.resolve().then(() => {
      try {
        const stmt = this.db.prepare(sql);
        return stmt.get(...(Array.isArray(params) ? params : [params]));
      } catch (error) {
        return Promise.reject(error);
      }
    });
  }

  /**
   * Get all rows
   * Returns an array of rows wrapped in a Promise for API compatibility
   */
  all(sql, params = []) {
    return Promise.resolve().then(() => {
      try {
        const stmt = this.db.prepare(sql);
        return stmt.all(...(Array.isArray(params) ? params : [params]));
      } catch (error) {
        return Promise.reject(error);
      }
    });
  }

  /**
   * Execute migration SQL (supports multiple statements)
   */
  async migrate(sql) {
    return this.run(sql);
  }

  /**
   * Close database connection
   */
  close() {
    return Promise.resolve().then(() => {
      try {
        this.db.close();
        logger.info('Database connection closed');
      } catch (error) {
        return Promise.reject(error);
      }
    });
  }
}

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../../database.db');
const db = new DatabaseWrapper(dbPath);

module.exports = db;
