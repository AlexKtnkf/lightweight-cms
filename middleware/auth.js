/**
 * Authentication middleware
 * Checks if user is logged in via session
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }

  // If it's an API request, return JSON
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Otherwise redirect to login
  res.redirect('/admin/login');
}

module.exports = requireAuth;
