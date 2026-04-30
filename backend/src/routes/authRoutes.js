// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword } = require('../controller/AuthController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);      // ✅ new
router.post('/reset-password/:token', resetPassword); // ✅ new

module.exports = router;