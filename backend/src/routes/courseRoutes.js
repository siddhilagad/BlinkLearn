const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2");

// ================= DB CONNECTION =================
// Option A: if you have a separate db.js file, use:
// const db = require('../db');
//
// Option B: inline connection (matches your server.js style)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Sanika@123",
  database: "blinklearn",
});

// ================= UPLOADS FOLDER =================
// Use the shared backend uploads directory so files are served from /uploads
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|webp/;
  const videoTypes = /mp4|mov|webm|mkv/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");

  if (file.fieldname === "thumbnail" && imageTypes.test(ext)) {
    cb(null, true);
  } else if (file.fieldname === "preview_video" && videoTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for field: ${file.fieldname}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

// ================= ADD COURSE =================
// Full URL: POST http://localhost:5000/api/add-course
router.post(
  "/add-course",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "preview_video", maxCount: 1 },
  ]),
  (req, res) => {
    console.log("✅ /api/add-course hit");
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    const { title, description, price, level, category, teacher_id } = req.body;

    if (!teacher_id)
      return res.status(400).json({ message: "teacher_id is missing" });
    if (!title || !description || price === undefined || !level)
      return res.status(400).json({ message: "All required fields must be filled" });

    const thumbnail = req.files?.thumbnail?.[0]?.filename || null;
    const preview_video = req.files?.preview_video?.[0]?.filename || null;

    if (!thumbnail)
      return res.status(400).json({ message: "Thumbnail is required" });

    const coursePrice = parseFloat(price) || 0;
    const courseType = coursePrice > 0 ? "paid" : "free";

    const sql = `
      INSERT INTO courses 
        (teacher_id, title, description, price, level, category, thumbnail, preview_video, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        teacher_id,
        title,
        description,
        coursePrice,
        level,
        category || null,
        thumbnail,
        preview_video,
        courseType,
      ],
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
// Full URL: GET http://localhost:5000/api/courses
router.get("/courses", (req, res) => {
  const { search } = req.query;

  let sql = `
    SELECT c.*, u.name AS tutor_name
    FROM courses c
    LEFT JOIN users u ON c.teacher_id = u.user_id
  `;
  const params = [];

  if (search) {
    sql += " WHERE c.title LIKE ? OR c.description LIKE ?";
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY c.course_id DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Fetch courses error:", err);
      return res.status(500).json({ message: "Failed to fetch courses" });
    }
    res.json(results);
  });
});

// ================= GET SINGLE COURSE =================
// Full URL: GET http://localhost:5000/api/course/:courseId
router.get("/course/:courseId", (req, res) => {
  const { courseId } = req.params;

  const sql = `
    SELECT c.*, u.name AS tutor_name, u.email AS teacher_email
    FROM courses c
    LEFT JOIN users u ON c.teacher_id = u.user_id
    WHERE c.course_id = ?
  `;

  db.query(sql, [courseId], (err, results) => {
    if (err) {
      console.error("Fetch course error:", err);
      return res.status(500).json({ message: "Failed to fetch course" });
    }
    if (results.length === 0)
      return res.status(404).json({ message: "Course not found" });
    res.json(results[0]);
  });
});

// ================= GET TEACHER COURSES =================
// Full URL: GET http://localhost:5000/api/teacher-courses/:id
router.get("/teacher-courses/:id", (req, res) => {
  db.query(
    "SELECT * FROM courses WHERE teacher_id = ? ORDER BY course_id DESC",
    [req.params.id],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error fetching teacher courses" });
      res.json(result);
    }
  );
});

// ================= EDIT COURSE =================
// Full URL: PUT http://localhost:5000/api/edit-course/:courseId
router.put(
  "/edit-course/:courseId",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "preview_video", maxCount: 1 },
  ]),
  (req, res) => {
    const { courseId } = req.params;
    const { title, description, price, level, category } = req.body;

    db.query(
      "SELECT thumbnail, preview_video FROM courses WHERE course_id = ?",
      [courseId],
      (err, existing) => {
        if (err || existing.length === 0)
          return res.status(404).json({ message: "Course not found" });

        const thumbnail =
          req.files?.thumbnail?.[0]?.filename || existing[0].thumbnail;
        const preview_video =
          req.files?.preview_video?.[0]?.filename || existing[0].preview_video;

        const coursePrice = parseFloat(price) || 0;
        const courseType = coursePrice > 0 ? "paid" : "free";

        db.query(
          `UPDATE courses 
           SET title=?, description=?, price=?, level=?, category=?,
               thumbnail=?, preview_video=?, type=?
           WHERE course_id=?`,
          [
            title,
            description,
            coursePrice,
            level,
            category || null,
            thumbnail,
            preview_video,
            courseType,
            courseId,
          ],
          (err2) => {
            if (err2)
              return res.status(500).json({ message: "Failed to update course" });
            res.json({ message: "Course updated successfully", thumbnail, preview_video });
          }
        );
      }
    );
  }
);

// ================= DELETE COURSE =================
// Full URL: DELETE http://localhost:5000/api/delete-course/:courseId
router.delete("/delete-course/:courseId", (req, res) => {
  const { courseId } = req.params;
  db.query(
    "DELETE FROM courses WHERE course_id = ?",
    [courseId],
    (err) => {
      if (err)
        return res.status(500).json({ message: "Failed to delete course" });
      res.json({ message: "Course deleted successfully" });
    }
  );
});

// ================= ENROLL =================
// Full URL: POST http://localhost:5000/api/enroll
router.post("/enroll", (req, res) => {
  const { user_id, course_id } = req.body;

  if (!user_id || !course_id)
    return res.status(400).json({ message: "user_id and course_id are required" });

  db.query(
    "SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?",
    [user_id, course_id],
    (err, existing) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (existing.length > 0)
        return res.status(400).json({ message: "Already enrolled" });

      db.query(
        "INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)",
        [user_id, course_id],
        (err2) => {
          if (err2)
            return res.status(500).json({ message: "Enrollment failed" });
          res.json({ message: "Enrolled successfully" });
        }
      );
    }
  );
});

// ================= MULTER ERROR HANDLER =================
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE")
      return res.status(400).json({ message: "File too large. Max 500MB allowed." });
    return res.status(400).json({ message: err.message });
  }
  if (err) return res.status(400).json({ message: err.message });
  next();
});

module.exports = router;