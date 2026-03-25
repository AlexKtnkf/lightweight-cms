const bcrypt = require('bcryptjs');
const userRepository = require('../infrastructure/userRepository');

class ChangePassword {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, oldPassword, newPassword) {
    const user = await this.userRepository.findByUsername(
      (await this.userRepository.findById(userId)).username
    );

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) {
      const error = new Error('Le mot de passe actuel est incorrect');
      error.status = 400;
      throw error;
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.userRepository.updatePassword(userId, passwordHash);
  }
}

module.exports = ChangePassword;
