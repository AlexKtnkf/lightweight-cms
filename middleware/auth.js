/**
 * Authentication middleware
 * Checks if user is logged in via session
 */
function requireAuth(req, res, next) {
  // Debug logging
  console.log('[requireAuth] Checking authentication:', {
    hasSession: !!req.session,
    sessionID: req.sessionID,
    userId: req.session?.userId,
    path: req.path,
    originalUrl: req.originalUrl,
    cookies: req.headers.cookie,
    sessionCookie: req.cookies?.sessionId
  });

  if (req.session && req.session.userId) {
    console.log('[requireAuth] User authenticated, allowing access');
    return next();
  }

  console.log('[requireAuth] User NOT authenticated - session:', {
    exists: !!req.session,
    userId: req.session?.userId,
    sessionID: req.sessionID
  });

  // If it's an API request (check originalUrl or if Content-Type is JSON), return JSON
  if (req.originalUrl?.startsWith('/api/') || req.get('Content-Type')?.includes('application/json') || req.get('Accept')?.includes('application/json')) {
    console.log('[requireAuth] API request detected, returning 401 JSON');
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Otherwise redirect to login
  console.log('[requireAuth] Redirecting to login');
  res.redirect('/admin/login');
}

module.exports = requireAuth;
