const logger = require('../../../utils/logger');
require('dotenv').config();

const { Client } = require('pg');

class Database {
  constructor() {
    // Try DATABASE_URL first, fall back to localhost for development
    let connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      connectionString = 'postgres://cms:cms_dev_password@localhost:5432/lightweight_cms';
    }

    this.client = new Client({ connectionString });
    this.ready = this.initializeConnection(connectionString);
  }

  async initializeConnection(connectionString) {
    try {
      await this.client.connect();
      logger.info('Connected to Postgres database');
    } catch (err) {
      // If using Railway internal hostname, try to extract public URL or provide helpful error
      if (err.code === 'ENOTFOUND' && connectionString.includes('postgres.railway.internal')) {
        logger.error('Cannot connect to Railway internal hostname from outside Railway infrastructure.');
        logger.error('Use "railway shell" to run commands inside Railway, or ensure DATABASE_URL points to public gateway URL.');
        throw err;
      }
      logger.error('Postgres connection error:', err);
      throw err;
    }
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

    const lastID = res.rows[0]?.id || null;

    return { lastID, changes: res.rowCount };
  }

  async raw(sql) {
    await this.ready;
    return this.client.query(sql);
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
