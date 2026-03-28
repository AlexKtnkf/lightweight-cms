const fs = require('fs');
const path = require('path');
const db = require('../src/infrastructure/database/database');
const logger = require('../utils/logger');

async function run() {
  const requestedPath = process.argv[2];
  const backupPath = requestedPath
    ? path.resolve(requestedPath)
    : path.join(__dirname, 'backups', 'latest-backup-seed.sql');

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`);
  }

  const sql = fs.readFileSync(backupPath, 'utf8');
  await db.raw(sql);
  logger.info(`✓ Database restored from ${backupPath}`);
}

run()
  .catch((error) => {
    logger.error('Restore failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
