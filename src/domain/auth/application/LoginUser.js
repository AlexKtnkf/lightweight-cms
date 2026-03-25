const bcrypt = require('bcryptjs');
const userRepository = require('../infrastructure/userRepository');

class LoginUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(username, password) {
    const user = await this.userRepository.findByUsername(username);
    
    if (!user) {
      const error = new Error('Mot de passe ou nom d\'utilisateur invalide');
      error.status = 401;
      throw error;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      const error = new Error('Mot de passe ou nom d\'utilisateur invalide');
      error.status = 401;
      throw error;
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = LoginUser;
