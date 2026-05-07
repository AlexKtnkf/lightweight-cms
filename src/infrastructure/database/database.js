const { AsyncLocalStorage } = require('async_hooks');
const logger = require('../../../utils/logger');
require('dotenv').config();

const { Pool } = require('pg');

// Stores the active transaction client for the current async context.
// All db methods automatically use it when inside a transaction().
const txStorage = new AsyncLocalStorage();

class Database {
  constructor() {
    const connectionString = process.env.DATABASE_URL ||
      'postgres://cms:cms_dev_password@localhost:5432/lightweight_cms';

    this.pool = new Pool({ connectionString });

    // Non-blocking startup probe — confirms connectivity and logs early.
    this.pool.connect()
      .then(client => {
        client.release();
        logger.info('Connected to Postgres database');
      })
      .catch(err => {
        if (err.code === 'ENOTFOUND') {
          logger.error(`Cannot reach database host: ${err.hostname || 'unknown'}`);
          logger.error('Ensure DATABASE_URL points to a reachable PostgreSQL instance and the process has network access.');
        } else {
          logger.error('Postgres connection error:', err);
        }
      });
  }

  // Return the transaction client if we are inside a transaction(), otherwise the pool.
  _runner() {
    return txStorage.getStore() || this.pool;
  }

  // Convert ? placeholders to $1, $2, ... for pg driver.
  // Handles single/double quoted strings, dollar-quoted strings and comments.
  convertPlaceholders(sql, params) {
    let idx = 0;
    let out = '';
    let i = 0;
    let inSingle = false;
    let inDouble = false;
    let inLineComment = false;
    let inBlockComment = false;
    let dollarTag = null;

    const tryReadDollarTag = (input, startIndex) => {
      const rest = input.slice(startIndex);
      const match = rest.match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/);
      return match ? match[0] : null;
    };

    while (i < sql.length) {
      const ch = sql[i];
      const next = i + 1 < sql.length ? sql[i + 1] : '';

      if (inSingle) {
        out += ch;
        if (ch === "'" && next === "'") {
          out += next;
          i += 2;
          continue;
        }
        if (ch === "'") inSingle = false;
        i += 1;
        continue;
      }

      if (inDouble) {
        out += ch;
        if (ch === '"' && next === '"') {
          out += next;
          i += 2;
          continue;
        }
        if (ch === '"') inDouble = false;
        i += 1;
        continue;
      }

      if (dollarTag) {
        if (sql.slice(i, i + dollarTag.length) === dollarTag) {
          out += dollarTag;
          i += dollarTag.length;
          dollarTag = null;
          continue;
        }
        out += ch;
        i += 1;
        continue;
      }

      if (inLineComment) {
        out += ch;
        if (ch === '\n') inLineComment = false;
        i += 1;
        continue;
      }

      if (inBlockComment) {
        out += ch;
        if (ch === '*' && next === '/') {
          out += next;
          i += 2;
          inBlockComment = false;
          continue;
        }
        i += 1;
        continue;
      }

      if (ch === "'") {
        inSingle = true;
        out += ch;
        i += 1;
        continue;
      }

      if (ch === '"') {
        inDouble = true;
        out += ch;
        i += 1;
        continue;
      }

      if (ch === '-' && next === '-') {
        inLineComment = true;
        out += ch + next;
        i += 2;
        continue;
      }

      if (ch === '/' && next === '*') {
        inBlockComment = true;
        out += ch + next;
        i += 2;
        continue;
      }

      if (ch === '$') {
        const tag = tryReadDollarTag(sql, i);
        if (tag) {
          dollarTag = tag;
          out += tag;
          i += tag.length;
          continue;
        }
      }

      if (ch === '?') {
        idx += 1;
        out += `$${idx}`;
        i += 1;
        continue;
      }

      out += ch;
      i += 1;
    }

    return { sql: out, params };
  }

  async run(sql, params = []) {
    const converted = this.convertPlaceholders(sql, params);
    const res = await this._runner().query(converted.sql, converted.params);

    const lastID = res.rows[0]?.id || null;

    return { lastID, changes: res.rowCount };
  }

  async executeScript(sql) {
    return this._runner().query(sql);
  }

  async get(sql, params = []) {
    const converted = this.convertPlaceholders(sql, params);
    const res = await this._runner().query(converted.sql, converted.params);
    return res.rows[0];
  }

  async all(sql, params = []) {
    const converted = this.convertPlaceholders(sql, params);
    const res = await this._runner().query(converted.sql, converted.params);
    return res.rows;
  }

  /**
   * Run fn inside a PostgreSQL transaction.
    * All db.run / db.get / db.all calls made within fn (in the same
   * async context) automatically use the dedicated transaction client via
   * AsyncLocalStorage — no changes required in repositories or use cases.
   */
  async transaction(fn) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await txStorage.run(client, fn);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
    logger.info('Postgres pool closed');
  }
}

module.exports = new Database();
