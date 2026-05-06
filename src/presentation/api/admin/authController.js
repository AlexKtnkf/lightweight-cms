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
      const user = await userRepository.create({
        username,
        password_hash: passwordHash
      });

      logger.info(`Initial admin user created: ${username}`);
      res.status(201).json({ 
        success: true, 
        message: `Admin user "${username}" created successfully`,
        userId: user.id
      });

    } catch (error) {
      logger.error('Admin setup error:', error);
      res.status(500).json({ 
        error: 'Failed to create admin user' 
      });
    }
  }

  /**
   * Return the current authenticated user's profile.
   * GET /api/admin/auth/me
   */
  async me(req, res) {
    try {
      const user = await userRepository.findById(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        id: user.id,
        username: user.username,
        role: user.role || 'editor',
        email: user.email || null,
        created_at: user.created_at,
        last_login: user.last_login
      });
    } catch (error) {
      logger.error('Me endpoint error:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }

  /**
   * List all users. Requires super_admin.
   * GET /api/admin/users
   */
  async listUsers(req, res) {
    try {
      const users = await userRepository.findAll();
      res.json(users);
    } catch (error) {
      logger.error('List users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  /**
   * Create a new user. Requires super_admin.
   * POST /api/admin/users
   * Body: { username, password, role, email? }
   */
  async createUser(req, res) {
    try {
      const { username, password, role, email } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      if (password.length < 12) {
        return res.status(400).json({ error: 'Password must be at least 12 characters' });
      }
      const allowedRoles = ['editor', 'admin', 'super_admin'];
      if (role && !allowedRoles.includes(role)) {
        return res.status(400).json({ error: `Invalid role. Allowed: ${allowedRoles.join(', ')}` });
      }

      const existing = await userRepository.findByUsername(username);
      if (existing) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      const user = await userRepository.create({
        username,
        password_hash: passwordHash,
        role: role || 'editor',
        email: email || null
      });

      logger.info(`User created: ${username} (role: ${user.role}) by ${req.session.username}`);
      res.status(201).json({ success: true, user });
    } catch (error) {
      logger.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  /**
   * Update a user's role and/or email. Requires super_admin.
   * PATCH /api/admin/users/:id
   * Body: { role?, email? }
   */
  async updateUser(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const { role, email } = req.body;

      const allowedRoles = ['editor', 'admin', 'super_admin'];
      if (role && !allowedRoles.includes(role)) {
        return res.status(400).json({ error: `Invalid role. Allowed: ${allowedRoles.join(', ')}` });
      }

      // Prevent a super_admin from demoting themselves
      if (String(id) === String(req.session.userId) && role && role !== 'super_admin') {
        return res.status(400).json({ error: 'Cannot change your own role' });
      }

      const user = await userRepository.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (role) await userRepository.updateRole(id, role);
      if (email !== undefined) await userRepository.updateEmail(id, email);

      const updated = await userRepository.findById(id);
      logger.info(`User ${id} updated by ${req.session.username}`);
      res.json({ success: true, user: updated });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  /**
   * Delete a user. Requires super_admin. Cannot delete yourself.
   * DELETE /api/admin/users/:id
   */
  async deleteUser(req, res) {
    try {
      const id = parseInt(req.params.id, 10);

      if (String(id) === String(req.session.userId)) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const user = await userRepository.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await userRepository.delete(id);
      logger.info(`User ${id} deleted by ${req.session.username}`);
      res.json({ success: true });
    } catch (error) {
      logger.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}

module.exports = new AuthController();
