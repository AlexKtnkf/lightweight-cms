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
      // Split SQL file into individual statements
      const statements = sql
        .split('\n')
        .map(line => {
          const commentIndex = line.indexOf('--');
          if (commentIndex >= 0) return line.substring(0, commentIndex);
          return line;
        })
        .join('\n')
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        if (!statement.trim()) continue;

        try {
          await db.run(statement);
        } catch (stmtErr) {
          const msg = String(stmtErr && stmtErr.message ? stmtErr.message : stmtErr).toLowerCase();
          const ignorable =
            msg.includes('already exists') ||
            msg.includes('duplicate key value');

          if (ignorable) {
            logger.warn(`Skipping already-applied statement in ${file}: ${statement.slice(0, 80)}...`);
            continue;
          }

          throw stmtErr;
        }
      }

      await db.run('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
      logger.info(`✓ Migration ${file} completed`);
    } catch (error) {
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
