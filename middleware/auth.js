const { isEnabled } = require('../src/shared/featureFlags');

/**
 * Authentication middleware
 * Checks if user is logged in via session
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }

  // If it's an API request, return JSON
  if (req.originalUrl?.startsWith('/api/') || req.get('Content-Type')?.includes('application/json') || req.get('Accept')?.includes('application/json')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Otherwise redirect to login
  res.redirect('/admin/login');
}

/**
 * Role middleware — requires the user's role to be one of the allowed roles.
 * Must be used after requireAuth.
 * @param {string[]} roles  Allowed roles, e.g. ['admin', 'super_admin']
 */
function requireRole(roles) {
  return function (req, res, next) {
    const role = req.session && req.session.userRole;
    if (role && roles.includes(role)) {
      return next();
    }
    return res.status(403).json({ error: 'Insufficient permissions' });
  };
}

/**
 * Feature flag middleware — returns 403 when a feature is disabled.
 * Super-admin users bypass all flags.
 * @param {string} flag  Feature flag name, e.g. 'FEATURE_SECTION_BLOG'
 */
function requireFeature(flag) {
  return function (req, res, next) {
    // super_admin bypasses all feature flags
    if (req.session && req.session.userRole === 'super_admin') {
      return next();
    }
    if (isEnabled(flag)) {
      return next();
    }
    return res.status(403).json({ error: 'Feature not available on this deployment' });
  };
}

module.exports = requireAuth;
module.exports.requireRole = requireRole;
module.exports.requireFeature = requireFeature;
