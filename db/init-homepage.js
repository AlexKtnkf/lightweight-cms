const db = require('../src/infrastructure/database/database');
const logger = require('../utils/logger');

async function initHomepage() {
  try {
    logger.info('Initializing homepage (page id = 1)...');
    
    // Check if homepage already exists
    const existing = await db.get('SELECT * FROM pages WHERE id = 1');
    
    if (existing) {
      logger.info('Homepage already exists, updating...');
      await db.run(
        `UPDATE pages 
         SET title = ?, slug = ?, published = ?, 
             meta_title = ?, meta_description = ?,
             updated_at = datetime('now')
         WHERE id = 1`,
        [
          'Page d\'accueil',
          'homepage',
          1,
          'Page d\'accueil',
          'Bienvenue sur notre site'
        ]
      );
      logger.info('✓ Homepage updated');
    } else {
      logger.info('Creating homepage...');
      await db.run(
        `INSERT INTO pages (
          id, title, slug, published, 
          meta_title, meta_description,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          1,
          'Page d\'accueil',
          'homepage',
          1,
          'Page d\'accueil',
          'Bienvenue sur notre site'
        ]
      );
      logger.info('✓ Homepage created');
    }
    
    logger.info('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('✗ Error initializing homepage:', error);
    process.exit(1);
  }
}

initHomepage();
