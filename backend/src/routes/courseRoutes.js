const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

// ===== Ensure uploads folder exists =====
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ===== Multer Storage =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

// ===== File Filter =====
const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|webp/;
  const videoTypes = /mp4|mov|webm|mkv/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

  if (file.fieldname === 'thumbnail' && imageTypes.test(ext)) {
    cb(null, true);
  } else if (file.fieldname === 'preview_video' && videoTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

// ================= ADD COURSE =================
router.post(
  '/add-course',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'preview_video', maxCount: 1 },
  ]),
  (req, res) => {
    console.log("✅ /add-course hit");
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    const { title, description, price, level, category, teacher_id } = req.body;

    if (!teacher_id) {
      return res.status(400).json({ message: "teacher_id is missing" });
    }
    if (!title || !description || !price || !level) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const thumbnail = req.files?.thumbnail?.[0]?.filename || null;
    const preview_video = req.files?.preview_video?.[0]?.filename || null;

    if (!thumbnail) {
      return res.status(400).json({ message: "Thumbnail is required" });
    }

    const sql = `
      INSERT INTO courses 
        (teacher_id, title, description, price, level, category, thumbnail, preview_video)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [teacher_id, title, description, price, level, category || null, thumbnail, preview_video],
      (err, result) => {
        if (err) {
          console.error("❌ DB Error:", err);
          return res.status(500).json({ message: "Course add failed", error: err.message });
        }
        console.log("✅ Course inserted, ID:", result.insertId);
        res.json({
          message: "Course added successfully",
          course_id: result.insertId,
          thumbnail,
          preview_video,
        });
      }
    );
  }
);

// ================= GET ALL COURSES =================
router.get('/courses', (req, res) => {
  const { search } = req.query;

  let sql = `
    SELECT c.*, u.fullname AS tutor_name
    FROM courses c
    LEFT JOIN users u ON c.teacher_id = u.user_id
  `;
  const params = [];

  if (search) {
    sql += ' WHERE c.title LIKE ? OR c.description LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY c.created_at DESC';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Fetch courses error:", err);
      return res.status(500).json({ message: "Failed to fetch courses" });
    }
    res.json(results);
  });
});

// ================= GET SINGLE COURSE =================
router.get('/course/:courseId', (req, res) => {
  const { courseId } = req.params;

  const sql = `
    SELECT c.*, u.fullname AS tutor_name
    FROM courses c
    LEFT JOIN users u ON c.teacher_id = u.user_id
    WHERE c.course_id = ?
  `;

  db.query(sql, [courseId], (err, results) => {
    if (err) {
      console.error("Fetch course error:", err);
      return res.status(500).json({ message: "Failed to fetch course" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(results[0]);
  });
});

// ================= EDIT COURSE =================
router.put(
  '/edit-course/:courseId',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'preview_video', maxCount: 1 },
  ]),
  (req, res) => {
    const { courseId } = req.params;
    const { title, description, price, level, category } = req.body;

    db.query(
      'SELECT thumbnail, preview_video FROM courses WHERE course_id = ?',
      [courseId],
      (err, existing) => {
        if (err || existing.length === 0) {
          return res.status(404).json({ message: "Course not found" });
        }

        const thumbnail =
          req.files?.thumbnail?.[0]?.filename || existing[0].thumbnail;
        const preview_video =
          req.files?.preview_video?.[0]?.filename || existing[0].preview_video;

        const sql = `
          UPDATE courses 
          SET title=?, description=?, price=?, level=?, category=?,
              thumbnail=?, preview_video=?
          WHERE course_id=?
        `;

        db.query(
          sql,
          [title, description, price, level, category, thumbnail, preview_video, courseId],
          (err2) => {
            if (err2) {
              console.error("Edit course error:", err2);
              return res.status(500).json({ message: "Failed to update course" });
            }
            res.json({ message: "Course updated successfully", thumbnail, preview_video });
          }
        );
      }
    );
  }
);

// ================= DELETE COURSE =================
router.delete('/delete-course/:courseId', (req, res) => {
  const { courseId } = req.params;
  db.query('DELETE FROM courses WHERE course_id = ?', [courseId], (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to delete course" });
    }
    res.json({ message: "Course deleted successfully" });
  });
});

// ================= ENROLL =================
router.post('/enroll', (req, res) => {
  const { user_id, course_id } = req.body;

  if (!user_id || !course_id) {
    return res.status(400).json({ message: "user_id and course_id are required" });
  }

  db.query(
    'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
    [user_id, course_id],
    (err, existing) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (existing.length > 0) {
        return res.status(400).json({ message: "Already enrolled" });
      }
      db.query(
        'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
        [user_id, course_id],
        (err2) => {
          if (err2) return res.status(500).json({ message: "Enrollment failed" });
          res.json({ message: "Enrolled successfully" });
        }
      );
    }
  );
});

// ================= SWITCH ROLE =================
router.put('/switch-role/:userId', (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['student', 'teacher'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const sql =
    role === 'teacher'
      ? 'UPDATE users SET role = ?, is_instructor = 1 WHERE user_id = ?'
      : 'UPDATE users SET role = ? WHERE user_id = ?';

  db.query(sql, [role, userId], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to switch role' });
    res.json({ message: 'Role switched successfully', role });
  });
});

// ================= ERROR HANDLER (multer) =================
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Max 500MB allowed.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

module.exports = router;