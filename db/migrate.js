const db = require('../src/infrastructure/database/database');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  logger.info(`Found ${files.length} migration(s)`);

  for (const file of files) {
    logger.info(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    try {
      // Split SQL file into individual statements
      // Remove line comments, then split by semicolon
      const statements = sql
        .split('\n')
        .map(line => {
          // Remove line comments (-- comments)
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
      for (const statement of statements) {
        if (statement.trim()) {
          await db.run(statement);
        }
      }
      
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
