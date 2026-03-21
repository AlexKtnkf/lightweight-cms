const logger = require('../utils/logger');

/**
 * Centralized error handling middleware
 */
function errorHandler(err, req, res, next) {
  logger.error('Error:', err);

  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' 
    ? ''
    : err.message;

  const status = err.status || 500;

  // If it's an API request, return JSON
  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ 
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Otherwise render error page
  res.status(status).render('errors/error', {
    status,
    message,
    error: process.env.NODE_ENV === 'development' ? err : null
  });
}

module.exports = errorHandler;
