const db = require('../src/infrastructure/database/database');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  const isPostgres = !!process.env.DATABASE_URL;

  // Track migrations so postinstall can run safely on every deploy
  await db.run('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at DATETIME DEFAULT CURRENT_TIMESTAMP)');

  logger.info(`Found ${files.length} migration(s)`);

  for (const file of files) {
    const alreadyApplied = await db.get('SELECT name FROM schema_migrations WHERE name = ?', [file]);
    if (alreadyApplied) {
      logger.info(`Skipping already applied migration: ${file}`);
      continue;
    }

    logger.info(`Running migration: ${file}`);
    let sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    try {
      // If running against Postgres, perform some safe transformations so
      // SQLite-flavored SQL can be applied to Postgres. This is heuristic
      // and intended for simple schemas used by this project.
      if (isPostgres) {
        // Remove PRAGMA statements
        sql = sql.replace(/\n?PRAGMA[^;]*;?/gi, '\n');

        // Replace common SQLite autoincrement PK with Postgres SERIAL
        sql = sql.replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');

        // Replace datetime('now') with CURRENT_TIMESTAMP
        sql = sql.replace(/datetime\('now'\)/gi, 'CURRENT_TIMESTAMP');

        // SQLite DATETIME type -> Postgres TIMESTAMP
        sql = sql.replace(/\bDATETIME\b/gi, 'TIMESTAMP');

        // SQLite boolean defaults (0/1) -> Postgres booleans
        sql = sql.replace(/\bBOOLEAN\s+DEFAULT\s+0\b/gi, 'BOOLEAN DEFAULT FALSE');
        sql = sql.replace(/\bBOOLEAN\s+DEFAULT\s+1\b/gi, 'BOOLEAN DEFAULT TRUE');

        // Convert "INSERT OR IGNORE INTO" to Postgres "INSERT INTO ... ON CONFLICT DO NOTHING"
        sql = sql.replace(/INSERT\s+OR\s+IGNORE\s+INTO\s+([\s\S]*?)\s*VALUES\s*([\s\S]*?);/gi, 'INSERT INTO $1 VALUES $2 ON CONFLICT DO NOTHING;');

        // Make reruns resilient for common ALTER TABLE adds
        sql = sql.replace(/ALTER\s+TABLE\s+(\w+)\s+ADD\s+COLUMN\s+(\w+)\s+/gi, 'ALTER TABLE $1 ADD COLUMN IF NOT EXISTS $2 ');
      }

      // Split SQL file into individual statements
      // Remove line comments (-- comments), then split by semicolon
      const statements = sql
        .split('\n')
        .map(line => {
          const commentIndex = line.indexOf('--');
          if (commentIndex >= 0) {
            return line.substring(0, commentIndex);
          }
          return line;
        })
        .join('\n')
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Execute each statement
      for (let statement of statements) {
        if (!statement.trim()) continue;

        // Skip empty PRAGMA or SQLite-specific statements
        if (/^PRAGMA\b/i.test(statement)) continue;

        // For Postgres ensure semicolon removed
        if (isPostgres) statement = statement.replace(/;$/, '');

        try {
          await db.run(statement);
        } catch (stmtErr) {
          const msg = String(stmtErr && stmtErr.message ? stmtErr.message : stmtErr).toLowerCase();
          const ignorable =
            msg.includes('duplicate column name') ||
            msg.includes('already exists') ||
            msg.includes('duplicate key value') ||
            msg.includes('relation') && msg.includes('already exists') ||
            msg.includes('column') && msg.includes('already exists');

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
