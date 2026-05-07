const db = require('./database');

class TransactionManager {
  async run(fn) {
    return db.transaction(fn);
  }

  async withAdvisoryLock(lockKey, fn) {
    return this.run(async () => {
      await db.get('SELECT pg_advisory_xact_lock(hashtext(?)) AS locked', [lockKey]);
      return fn();
    });
  }
}

module.exports = new TransactionManager();
