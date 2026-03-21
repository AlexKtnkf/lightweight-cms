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
        const sql = `INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`;
        await db.run(sql, [username, passwordHash]);
        logger.info(`✓ Utilisateur admin "${username}" créé avec succès`);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint')) {
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
