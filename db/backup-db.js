const fs = require('fs');
const path = require('path');
const db = require('../src/infrastructure/database/database');
const logger = require('../utils/logger');

const TABLES = [
  'settings',
  'media',
  'pages',
  'articles',
  'content_blocks',
  'homepage',
  'users',
  'contact_submissions',
];

function timestampForFilename(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function sqlLiteral(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL';
  }

  if (value instanceof Date) {
    return `'${value.toISOString().replace('T', ' ').replace('Z', '+00')}'`;
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}

async function getExistingTables() {
  const rows = await db.all(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `);

  const existing = new Set(rows.map((row) => row.table_name));
  return TABLES.filter((table) => existing.has(table));
}

async function getTableColumns(table) {
  const rows = await db.all(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ?
      ORDER BY ordinal_position
    `,
    [table]
  );

  return rows.map((row) => row.column_name);
}

async function getTableRows(table) {
  return db.all(`SELECT * FROM ${table} ORDER BY id ASC`);
}

function renderInsertStatements(table, columns, rows) {
  if (rows.length === 0) {
    return [`-- ${table}: no rows`];
  }

  const columnList = columns.join(', ');
  return rows.map((row) => {
    const values = columns.map((column) => sqlLiteral(row[column])).join(', ');
    return `INSERT INTO ${table} (${columnList}) VALUES (${values});`;
  });
}

function renderSequenceStatements(tables) {
  return tables.map(
    (table) =>
      `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM ${table};`
  );
}

async function createBackup() {
  const existingTables = await getExistingTables();
  if (existingTables.length === 0) {
    throw new Error('No application tables found to back up.');
  }

  const backupDir = path.join(__dirname, 'backups');
  fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = timestampForFilename();
  const backupFilename = `${timestamp}-backup-seed.sql`;
  const latestFilename = 'latest-backup-seed.sql';
  const backupPath = path.join(backupDir, backupFilename);
  const latestPath = path.join(backupDir, latestFilename);

  const sqlChunks = [
    '-- ============================================',
    '-- Database Backup Seed',
    `-- Generated at: ${new Date().toISOString()}`,
    '-- Restore with: npm run migrate && npm run restore:db -- db/backups/<file>.sql',
    '-- ============================================',
    '',
    'BEGIN;',
    `TRUNCATE TABLE ${existingTables.join(', ')} RESTART IDENTITY CASCADE;`,
    '',
  ];

  for (const table of existingTables) {
    const columns = await getTableColumns(table);
    const rows = await getTableRows(table);

    sqlChunks.push(`-- Table: ${table}`);
    sqlChunks.push(...renderInsertStatements(table, columns, rows));
    sqlChunks.push('');
  }

  sqlChunks.push('-- Reset serial sequences');
  sqlChunks.push(...renderSequenceStatements(existingTables));
  sqlChunks.push('');
  sqlChunks.push('COMMIT;');
  sqlChunks.push('');

  fs.writeFileSync(backupPath, sqlChunks.join('\n'), 'utf8');
  fs.copyFileSync(backupPath, latestPath);

  logger.info(`✓ Backup seed written to ${backupPath}`);
  logger.info(`✓ Latest backup alias updated at ${latestPath}`);

  return {
    filename: backupFilename,
    path: backupPath,
    latestPath,
  };
}

async function run() {
  try {
    await createBackup();
  } catch (error) {
    logger.error('Backup failed:', error);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  run();
}

module.exports = {
  createBackup,
};
