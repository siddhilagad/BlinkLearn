// src/services/authService.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

class AuthService {
  async registerUser({ fullname, email, password, accountType }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = `
        INSERT INTO users (fullname, email, password, role)
        VALUES (?, ?, ?, ?)
      `;

      const result = await new Promise((resolve, reject) => {
        db.query(sql, [fullname, email, hashedPassword, accountType], (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      });

      return { success: true, message: 'Registration successful', insertId: result.insertId };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already exists');
      }
      throw new Error('Registration failed');
    }
  }

  async loginUser({ email, password }) {
    try {
      const sql = `SELECT * FROM users WHERE email = ?`;
      
      const results = await new Promise((resolve, reject) => {
        db.query(sql, [email], (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      });

      if (results.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      return {
        id: user.id,
        name: user.fullname,
        email: user.email,
        role: user.role,
      };
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new AuthService();