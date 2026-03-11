// src/controllers/authController.js
const authService = require('../service/AuthService');

const register = async (req, res) => {
  try {
    const { fullname, email, password, accountType } = req.body;

    if (!fullname || !email || !password || !accountType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await authService.registerUser({ fullname, email, password, accountType });

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Register error:', error.message);
    
    if (error.message === 'Email already exists') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

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

// const bookingUser = async(req,res){
//     //API Responnse Login
// }

module.exports = {
  register,
  login,
};