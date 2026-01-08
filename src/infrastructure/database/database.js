const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const path = require('path');
const logger = require('../../../utils/logger');
require('dotenv').config();

class Database {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Error opening database:', err);
        throw err;
      }
      logger.info('Connected to SQLite database');
    });
    
    // Promisify methods for async/await
    // db.run needs special handling because it uses 'this' context
    const self = this;
    this.run = function(sql, params = []) {
      return new Promise((resolve, reject) => {
        self.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    };
    
    this.get = promisify(this.db.get.bind(this.db));
    this.all = promisify(this.db.all.bind(this.db));
  }

  // Execute migration SQL
  async migrate(sql) {
    return this.run(sql);
  }

  // Close connection
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
          else {
            logger.info('Database connection closed');
            resolve();
          }
      });
    });
  }
}

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../../database.db');
const db = new Database(dbPath);

module.exports = db;
