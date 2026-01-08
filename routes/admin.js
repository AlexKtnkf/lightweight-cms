const express = require('express');
const router = express.Router();
const path = require('path');
const adminController = require('../src/presentation/web/adminController');
const { loginLimiter } = require('../config/security');

// Public admin routes (login only - React handles the rest)
router.get('/login', (req, res) => {
  // If already logged in, redirect to admin
  if (req.session && req.session.userId) {
    return res.redirect('/admin');
  }
  // Let React handle the login page
  res.redirect('/admin/login');
});

router.post('/login', loginLimiter, adminController.login);
router.get('/logout', adminController.logout);

module.exports = router;
