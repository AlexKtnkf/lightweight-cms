const LoginUser = require('../../domain/auth/application/LoginUser');
const userRepository = require('../../domain/auth/infrastructure/userRepository');

const loginUser = new LoginUser(userRepository);

class AdminController {
  // Login - returns JSON for React admin
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      
      // Trim whitespace from inputs
      const trimmedUsername = username ? username.trim() : '';
      const trimmedPassword = password ? password.trim() : '';
      
      if (!trimmedUsername || !trimmedPassword) {
        return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
      }
      
      const user = await loginUser.execute(trimmedUsername, trimmedPassword);
      
      // Set session
      if (!req.session) {
        return res.status(500).json({ error: 'Erreur de session' });
      }
      
      req.session.userId = user.id;
      req.session.username = user.username;
      
      // Force save session and wait for it before responding
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('[Login] Session save error:', err);
            return reject(err);
          }
          console.log('[Login] Session saved successfully:', {
            sessionID: req.sessionID,
            userId: req.session.userId
          });
          resolve();
        });
      });
      
      // Log response headers to verify cookie is being set
      console.log('[Login] Response headers before send:', {
        'Set-Cookie': res.getHeader('Set-Cookie'),
        allHeaders: res.getHeaders()
      });
      
      // express-session will set the cookie automatically
      res.json({ success: true, sessionId: req.sessionID });
    } catch (error) {
      res.status(401).json({ error: error.message || 'Invalid username or password' });
    }
  }

  // Logout
  async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.redirect('/admin/login');
    });
  }
}

module.exports = new AdminController();
