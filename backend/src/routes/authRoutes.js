// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controller/AuthController');

router.post('/register', register);
router.post('/login', login);
// router.post("/booking", Bookinguser)

module.exports = router;