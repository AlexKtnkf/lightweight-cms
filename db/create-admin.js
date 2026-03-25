const db = require('../src/infrastructure/database/database');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const logger = require('../utils/logger');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdmin() {
  rl.question('Nom d\'utilisateur: ', async (username) => {
    rl.question('Mot de passe: ', async (password) => {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      try {
        const sql = `INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, CURRENT_TIMESTAMP) RETURNING id`;
        await db.run(sql, [username, passwordHash]);
        logger.info(`✓ Utilisateur admin "${username}" créé avec succès`);
      } catch (error) {
        const isRailwayNetworkError = 
          error.code === 'ENOTFOUND' && 
          error.message?.includes('postgres.railway.internal');
        
        if (isRailwayNetworkError) {
          logger.error('\n❌ Railway Networking Error');
          logger.error('You cannot connect to Railway\'s internal Postgres from outside the Railway environment.');
          logger.error('\n✓ Solution: Use Railway shell instead:');
          logger.error('   railway shell');
          logger.error('   npm run create-admin\n');
        } else if (error.code === '23505') {
          logger.error('✗ Un utilisateur avec ce nom existe déjà');
        } else {
          logger.error('✗ Erreur:', error.message);
        }
      }

      await db.close();
      rl.close();
      process.exit(0);
    });
  });
}

createAdmin();
