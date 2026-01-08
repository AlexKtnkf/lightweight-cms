const bcrypt = require('bcrypt');
const userRepository = require('../infrastructure/userRepository');

class CreateUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(username, password) {
    // Check if user exists
    const existing = await this.userRepository.findByUsername(username);
    if (existing) {
      const error = new Error('Username already exists');
      error.status = 400;
      throw error;
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.userRepository.create({
      username,
      password_hash: passwordHash
    });

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = CreateUser;
