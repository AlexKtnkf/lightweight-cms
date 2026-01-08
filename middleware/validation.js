const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // If it's an API request, return JSON
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({ 
        errors: errors.array() 
      });
    }

    // Otherwise, pass errors to next handler
    req.validationErrors = errors.array();
    return next();
  }

  next();
}

module.exports = validate;
