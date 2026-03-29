// src/controller/AuthController.js
const authService = require('../service/AuthService');

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { fullname, email, password, accountType } = req.body;
    if (!fullname || !email || !password || !accountType) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    await authService.registerUser({
      name: fullname,
      email: email,
      password: password,
      account_type: accountType
    });
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Register error:', error.message);
    if (error.message === 'Email already exists') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await authService.loginUser({ email, password });
    res.status(200).json({
      message: 'Login successful',
      user,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({ message: error.message });
  }
};

// ================= FORGOT PASSWORD =================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    await authService.forgotPassword(email);
    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    await authService.resetPassword(token, password);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    if (error.message === 'Invalid or expired token') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};