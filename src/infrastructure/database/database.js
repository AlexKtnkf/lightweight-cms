const path = require('path');
const logger = require('../../../utils/logger');
require('dotenv').config();

// Dual DB wrapper: Postgres (via DATABASE_URL) or SQLite fallback
let dbInstance = null;

if (process.env.DATABASE_URL) {
  // Use Postgres when DATABASE_URL is set (Railway will provide this)
  const { Client } = require('pg');

  class PostgresWrapper {
    constructor(connectionString) {
      this.client = new Client({ connectionString });
      this.ready = this.client.connect()
        .then(() => logger.info('Connected to Postgres database'))
        .catch(err => {
          logger.error('Postgres connection error:', err);
          throw err;
        });
    }

    convertSql(sql, params) {
      let out = sql.replace(/datetime\('now'\)/gi, 'CURRENT_TIMESTAMP');
      let idx = 0;
      let inSingle = false;
      let inDouble = false;

      out = out.split('').map(ch => {
        if (ch === "'" && !inDouble) {
          inSingle = !inSingle;
          return ch;
        }
        if (ch === '"' && !inSingle) {
          inDouble = !inDouble;
          return ch;
        }
        if (ch === '?' && !inSingle && !inDouble) {
          idx += 1;
          return `$${idx}`;
        }
        return ch;
      }).join('');

      return { sql: out, params };
    }

    async run(sql, params = []) {
      await this.ready;
      const converted = this.convertSql(sql, params);
      const res = await this.client.query(converted.sql, converted.params);

      let lastID = (res.rows[0] && (res.rows[0].id || res.rows[0].lastval)) || null;
      if (!lastID && /^\s*insert\b/i.test(converted.sql)) {
        try {
          const idRes = await this.client.query('SELECT LASTVAL() AS id');
          lastID = idRes.rows[0] ? idRes.rows[0].id : null;
        } catch (e) {
          lastID = null;
        }
      }

      return { lastID, changes: res.rowCount };
    }

    async get(sql, params = []) {
      await this.ready;
      const converted = this.convertSql(sql, params);
      const res = await this.client.query(converted.sql, converted.params);
      return res.rows[0];
    }

    async all(sql, params = []) {
      await this.ready;
      const converted = this.convertSql(sql, params);
      const res = await this.client.query(converted.sql, converted.params);
      return res.rows;
    }

    // For migration convenience (keeps same API)
    async migrate(sql) {
      return this.run(sql);
    }

    async close() {
      await this.client.end();
      logger.info('Postgres client disconnected');
    }
  }

  dbInstance = new PostgresWrapper(process.env.DATABASE_URL);

} else {
  // SQLite fallback (local dev)
  const Database = require('better-sqlite3');

  class SqliteWrapper {
    constructor(dbPath) {
      try {
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        logger.info('Connected to SQLite database');
      } catch (error) {
        logger.error('Error opening database:', error);
        throw error;
      }
    }

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

    async migrate(sql) {
      return this.run(sql);
    }

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
  dbInstance = new SqliteWrapper(dbPath);
}

module.exports = dbInstance;
