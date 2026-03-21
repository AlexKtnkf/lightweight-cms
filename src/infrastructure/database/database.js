const logger = require('../../../utils/logger');
require('dotenv').config();

const { Client } = require('pg');

class Database {
  constructor() {
    const connectionString = process.env.DATABASE_URL
      || 'postgres://cms:cms_dev_password@localhost:5432/lightweight_cms';
    this.client = new Client({ connectionString });
    this.ready = this.client.connect()
      .then(() => logger.info('Connected to Postgres database'))
      .catch(err => {
        logger.error('Postgres connection error:', err);
        throw err;
      });
  }

  // Convert ? placeholders to $1, $2, ... for pg driver
  convertPlaceholders(sql, params) {
    let idx = 0;
    let inSingle = false;
    let inDouble = false;

    const out = sql.split('').map(ch => {
      if (ch === "'" && !inDouble) { inSingle = !inSingle; return ch; }
      if (ch === '"' && !inSingle) { inDouble = !inDouble; return ch; }
      if (ch === '?' && !inSingle && !inDouble) { idx += 1; return `$${idx}`; }
      return ch;
    }).join('');

    return { sql: out, params };
  }

  async run(sql, params = []) {
    await this.ready;
    const converted = this.convertPlaceholders(sql, params);
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
    const converted = this.convertPlaceholders(sql, params);
    const res = await this.client.query(converted.sql, converted.params);
    return res.rows[0];
  }

  async all(sql, params = []) {
    await this.ready;
    const converted = this.convertPlaceholders(sql, params);
    const res = await this.client.query(converted.sql, converted.params);
    return res.rows;
  }

  async close() {
    await this.client.end();
    logger.info('Postgres client disconnected');
  }
}

module.exports = new Database();
