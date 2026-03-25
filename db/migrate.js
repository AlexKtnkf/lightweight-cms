const db = require('../src/infrastructure/database/database');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  await db.run('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');

  logger.info(`Found ${files.length} migration(s)`);

  for (const file of files) {
    const alreadyApplied = await db.get('SELECT name FROM schema_migrations WHERE name = ?', [file]);
    if (alreadyApplied) {
      logger.info(`Skipping already applied migration: ${file}`);
      continue;
    }

    logger.info(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    try {
      await db.raw('BEGIN');
      await db.raw(sql);
      await db.run('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
      await db.raw('COMMIT');
      logger.info(`✓ Migration ${file} completed`);
    } catch (error) {
      try {
        await db.raw('ROLLBACK');
      } catch (rollbackError) {
        logger.error(`Rollback failed for migration ${file}:`, rollbackError);
      }
      logger.error(`✗ Migration ${file} failed:`, error);
      throw error;
    }
  }

  logger.info('All migrations completed successfully');
  await db.close();
  process.exit(0);
}

runMigrations().catch(error => {
  logger.error('Migration failed:', error);
  process.exit(1);
});
