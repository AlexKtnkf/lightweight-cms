const bcrypt = require('bcryptjs');
const userRepository = require('../../../domain/auth/infrastructure/userRepository');
const logger = require('../../../../utils/logger');

class AuthController {
  /**
   * Reset admin password (protected endpoint)
   * Requires either:
   * 1. Valid setup token (for initial setup)
   * 2. Authenticated session with existing admin
   * 
   * POST /api/admin/auth/reset-password
   * Body: { username, newPassword, setupToken? }
   */
  async resetPassword(req, res) {
    try {
      const { username, newPassword, setupToken } = req.body;

      // Validate inputs
      if (!username || !newPassword) {
        return res.status(400).json({ 
          error: 'Username and new password are required' 
        });
      }

      if (newPassword.length < 12) {
        return res.status(400).json({ 
          error: 'Password must be at least 12 characters' 
        });
      }

      // Check authorization: either valid setup token or authenticated session
      const isSetup = setupToken && setupToken === process.env.SETUP_TOKEN;
      const isAuthenticated = req.session && req.session.userId;

      if (!isSetup && !isAuthenticated) {
        logger.warn(`Unauthorized password reset attempt for user: ${username}`);
        return res.status(403).json({ 
          error: 'Unauthorized. Use setup token during initial setup or authenticate first.' 
        });
      }

      // Find user
      const user = await userRepository.findByUsername(username);
      if (!user) {
        return res.status(404).json({ 
          error: `User not found: ${username}` 
        });
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await userRepository.updatePassword(user.id, passwordHash);

      logger.info(`Password reset for user: ${username}`);
      res.json({ 
        success: true, 
        message: `Password updated for user "${username}"` 
      });

    } catch (error) {
      logger.error('Password reset error:', error);
      res.status(500).json({ 
        error: 'Failed to reset password' 
      });
    }
  }

  /**
   * Create initial admin user (setup endpoint)
   * Only works if no admin users exist and setup token is provided
   * 
   * POST /api/admin/auth/setup-admin
   * Body: { username, password, setupToken }
   */
  async setupAdmin(req, res) {
    try {
      const { username, password, setupToken } = req.body;

      // Validate setup token
      if (!setupToken || setupToken !== process.env.SETUP_TOKEN) {
        logger.warn('Invalid setup token attempt');
        return res.status(403).json({ 
          error: 'Invalid or missing setup token' 
        });
      }

      // Validate inputs
      if (!username || !password) {
        return res.status(400).json({ 
          error: 'Username and password are required' 
        });
      }

      if (password.length < 12) {
        return res.status(400).json({ 
          error: 'Password must be at least 12 characters' 
        });
      }

      // Check if any users exist
      const allUsers = await userRepository.findAll?.() || [];
      if (allUsers.length > 0) {
        logger.warn('Setup attempt when users already exist');
        return res.status(403).json({ 
          error: 'Users already exist. Use password reset instead.' 
        });
      }

      // Check if username already exists
      const existingUser = await userRepository.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({ 
          error: 'Username already exists' 
        });
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const sql = `INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, CURRENT_TIMESTAMP) RETURNING id`;
      const result = await userRepository.db.run(sql, [username, passwordHash]);

      logger.info(`Initial admin user created: ${username}`);
      res.status(201).json({ 
        success: true, 
        message: `Admin user "${username}" created successfully`,
        userId: result.lastID
      });

    } catch (error) {
      logger.error('Admin setup error:', error);
      res.status(500).json({ 
        error: 'Failed to create admin user' 
      });
    }
  }
}

module.exports = new AuthController();
