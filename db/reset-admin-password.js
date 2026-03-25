const bcrypt = require('bcryptjs');
const readline = require('readline');
const db = require('../src/infrastructure/database/database');
const userRepository = require('../src/domain/auth/infrastructure/userRepository');
const logger = require('../utils/logger');

function parseArg(name) {
  const prefix = `--${name}=`;
  const exact = `--${name}`;

  for (let index = 2; index < process.argv.length; index += 1) {
    const arg = process.argv[index];
    if (arg.startsWith(prefix)) {
      return arg.slice(prefix.length);
    }
    if (arg === exact) {
      return process.argv[index + 1];
    }
  }

  return undefined;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function askHidden(question) {
  return new Promise(resolve => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdout.write(question);
    stdin.resume();
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');

    let value = '';

    function cleanup() {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener('data', onData);
      stdout.write('\n');
    }

    function onData(char) {
      if (char === '\u0003') {
        cleanup();
        process.exit(130);
      }

      if (char === '\r' || char === '\n') {
        cleanup();
        resolve(value);
        return;
      }

      if (char === '\u007f') {
        value = value.slice(0, -1);
        return;
      }

      value += char;
    }

    stdin.on('data', onData);
  });
}

async function readPasswordFromStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks.map(chunk => Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))).toString('utf8').trim();
}

function validatePassword(password) {
  if (!password || password.length < 12) {
    throw new Error('Le mot de passe doit faire au moins 12 caractères');
  }
}

async function main() {
  const username = parseArg('username') || parseArg('user') || await ask('Nom d\'utilisateur admin : ');
  const stdinMode = hasFlag('stdin');

  if (!username) {
    throw new Error('Le nom d\'utilisateur est requis');
  }

  const user = await userRepository.findByUsername(username);
  if (!user) {
    throw new Error(`Utilisateur introuvable : ${username}`);
  }

  let newPassword;
  if (stdinMode) {
    newPassword = await readPasswordFromStdin();
  } else {
    newPassword = await askHidden('Nouveau mot de passe : ');
    const confirmPassword = await askHidden('Confirmez le mot de passe : ');
    if (newPassword !== confirmPassword) {
      throw new Error('Les mots de passe ne correspondent pas');
    }
  }

  validatePassword(newPassword);

  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);
  await userRepository.updatePassword(user.id, passwordHash);

  logger.info(`✓ Mot de passe mis à jour pour l'utilisateur admin "${username}"`);
}

main()
  .catch(async error => {
    const isRailwayNetworkError = 
      error.code === 'ENOTFOUND' && 
      error.message?.includes('postgres.railway.internal');
    
    if (isRailwayNetworkError) {
      logger.error('\n❌ Railway Networking Error');
      logger.error('You cannot connect to Railway\'s internal Postgres from outside the Railway environment.');
      logger.error('\n✓ Solution: Use Railway shell instead:');
      logger.error('   railway shell');
      logger.error('   npm run reset-admin-password\n');
    } else {
      logger.error(`✗ ${error.message}`);
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });