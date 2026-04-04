const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db'); // adjust path to your DB connection file

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST /api/courses/add-course
router.post('/add-course', upload.single('thumbnail'), (req, res) => {
  console.log("Body:", req.body);
  console.log("File:", req.file);

  const { title, description, price, level, teacher_id } = req.body;

  if (!teacher_id) {
    return res.status(400).json({ message: "teacher_id is missing" });
  }

  const thumbnail = req.file ? req.file.filename : null;

  const sql = `INSERT INTO courses (teacher_id, title, description, price, level, thumbnail) 
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [teacher_id, title, description, price, level, thumbnail], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Course add failed", error: err.message });
    }
    res.json({ message: "Course added successfully" });
  });
});

module.exports = router;
// In backend/src/routes/courseRoutes.js — add this at the bottom

const db = require('../config/db'); // adjust path to your db connection

// ================= SWITCH ROLE =================
router.put('/switch-role/:userId', (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['student', 'teacher'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const sql = role === 'teacher'
    ? 'UPDATE users SET role = ?, is_instructor = 1 WHERE user_id = ?'
    : 'UPDATE users SET role = ? WHERE user_id = ?';

  db.query(sql, [role, userId], (err) => {
    if (err) {
      console.log('Switch role error:', err);
      return res.status(500).json({ message: 'Failed to switch role' });
    }
    res.json({ message: 'Role switched successfully', role });
  });
});