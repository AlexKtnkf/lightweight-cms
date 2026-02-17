const express = require('express');
const router = express.Router();
const path = require('path');
const adminController = require('../src/presentation/web/adminController');
const { loginLimiter } = require('../config/security');

// Public admin routes (login only - React handles the rest)
// Note: The login page is served by React, so we only handle redirects here
router.get('/login', (req, res, next) => {
  // If already logged in, redirect to admin dashboard
  if (req.session && req.session.userId) {
    return res.redirect('/admin');
  }
  // Otherwise, let the static file handler or Vite serve the React app
  next();
});

router.post('/login', loginLimiter, adminController.login);
router.get('/logout', adminController.logout);

module.exports = router;
