const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Sanika@123",
  database: "blinklearn",
});

db.connect((err) => {
  if (err) { console.error("❌ CourseRoutes DB connection failed:", err); return; }
  console.log("✅ CourseRoutes connected to MySQL");
  db.query(`CREATE TABLE IF NOT EXISTS lessons (
    lesson_id INT AUTO_INCREMENT PRIMARY KEY, course_id INT NOT NULL, section_id INT,
    title VARCHAR(255) NOT NULL, type VARCHAR(50) DEFAULT 'video', duration VARCHAR(50),
    description TEXT, video_url VARCHAR(255), order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => {
    if (err) console.error("Failed to ensure lessons table:", err);
  });
});

const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});

const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|webp/;
  const videoTypes = /mp4|mov|webm|mkv/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  if (file.fieldname === "thumbnail" && imageTypes.test(ext)) return cb(null, true);
  if ((file.fieldname === "preview_video" || file.fieldname.startsWith("lesson_video_")) && videoTypes.test(ext)) return cb(null, true);
  cb(new Error(`Invalid file type for field: ${file.fieldname}`));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 500 * 1024 * 1024 } });

// ================= ADD COURSE =================
router.post("/add-course", upload.any(), (req, res) => {
  const { title, description, price, level, category, teacher_id, sections } = req.body;
  if (!teacher_id) return res.status(400).json({ message: "teacher_id is missing" });
  if (!title || !description || price === undefined || !level)
    return res.status(400).json({ message: "All required fields must be filled" });

  const filesMap = {};
  (req.files || []).forEach((file) => { filesMap[file.fieldname] = file; });
  const thumbnail = filesMap.thumbnail?.filename || null;
  const preview_video = filesMap.preview_video?.filename || null;
  if (!thumbnail) return res.status(400).json({ message: "Thumbnail is required" });

  let parsedSections = [];
  if (sections) {
    try { parsedSections = typeof sections === "string" ? JSON.parse(sections) : sections; }
    catch (err) { return res.status(400).json({ message: "Invalid sections format" }); }
  }

  const coursePrice = parseFloat(price) || 0;
  const courseType = coursePrice > 0 ? "paid" : "free";

  db.query(
    `INSERT INTO courses (teacher_id, title, description, price, level, category, thumbnail, preview_video, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [teacher_id, title, description, coursePrice, level, category || null, thumbnail, preview_video, courseType],
    (err, result) => {
      if (err) { console.error("DB Error:", err); return res.status(500).json({ message: "Course add failed", error: err.message }); }
      if (parsedSections.length === 0) return res.json({ message: "Course added successfully", course_id: result.insertId, thumbnail, preview_video });

      const sectionRows = parsedSections.map((section, index) => [result.insertId, section.title?.trim() || `Section ${index + 1}`, index]);
      db.query(`INSERT INTO course_sections (course_id, title, order_index) VALUES ?`, [sectionRows], (sectionErr, sectionResult) => {
        if (sectionErr) return res.status(500).json({ message: "Course created but section save failed", error: sectionErr.message });

        const firstSectionId = sectionResult.insertId;
        const sectionIds = Array.from({ length: sectionRows.length }, (_, idx) => firstSectionId + idx);
        const lessonRows = [];
        parsedSections.forEach((section, sectionIndex) => {
          const sectionId = sectionIds[sectionIndex];
          (section.lessons || []).forEach((lesson, lessonIndex) => {
            const lessonFile = lesson.videoField ? filesMap[lesson.videoField] : null;
            lessonRows.push([result.insertId, sectionId, lesson.title || "Untitled Lesson", lesson.type || "video", parseInt(lesson.duration, 10) || 0, lessonFile?.filename || null, sectionIndex * 1000 + lessonIndex]);
          });
        });

        const finish = () => res.json({ message: "Course added successfully", course_id: result.insertId, thumbnail, preview_video });
        if (lessonRows.length === 0) return finish();
        db.query(`INSERT INTO lessons (course_id, section_id, title, type, duration, video_url, order_index) VALUES ?`, [lessonRows], (lessonErr) => {
          if (lessonErr) return res.status(500).json({ message: "Course created but lesson save failed", error: lessonErr.message });
          finish();
        });
      });
    }
  );
});

// ================= GET ALL COURSES =================
router.get("/courses", (req, res) => {
  const { search } = req.query;
  let sql = `
    SELECT c.*, u.name AS tutor_name,
      ROUND(IFNULL(AVG(r.rating), 0), 1) AS avg_rating,
      COUNT(DISTINCT r.id) AS total_reviews,
      COUNT(DISTINCT e.user_id) AS total_students,
      COUNT(DISTINCT l.lesson_id) AS total_lessons
    FROM courses c
    LEFT JOIN users u ON c.teacher_id = u.user_id
    LEFT JOIN reviews r ON r.course_id = c.course_id
    LEFT JOIN enrollments e ON e.course_id = c.course_id
    LEFT JOIN lessons l ON l.course_id = c.course_id
  `;
  const params = [];
  if (search) { sql += " WHERE c.title LIKE ? OR c.description LIKE ?"; params.push(`%${search}%`, `%${search}%`); }
  sql += " GROUP BY c.course_id ORDER BY c.course_id DESC";
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch courses" });
    res.json(results);
  });
});

// ================= GET SINGLE COURSE =================
router.get("/course/:courseId", (req, res) => {
  const { courseId } = req.params;
  const sql = `
    SELECT c.*, u.name AS tutor_name, u.email AS teacher_email,
      ROUND(IFNULL(AVG(r.rating), 0), 1) AS avg_rating,
      COUNT(DISTINCT r.id) AS total_reviews
    FROM courses c
    LEFT JOIN users u ON c.teacher_id = u.user_id
    LEFT JOIN reviews r ON r.course_id = c.course_id
    WHERE c.course_id = ?
    GROUP BY c.course_id
  `;
  db.query(sql, [courseId], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch course" });
    if (results.length === 0) return res.status(404).json({ message: "Course not found" });
    res.json(results[0]);
  });
});

// ================= GET TEACHER COURSES =================
router.get("/teacher-courses/:id", (req, res) => {
  db.query("SELECT * FROM courses WHERE teacher_id = ? ORDER BY course_id DESC", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching teacher courses" });
    res.json(result);
  });
});

// ================= GET USER COURSES =================
router.get("/courses/user/:userId", (req, res, next) => {
  try {
    const { userId } = req.params;
    const role = String(req.query.role || "").toLowerCase();
    if (role === "student") {
      db.execute(
        `SELECT c.*, u.name AS tutor_name FROM enrollments e JOIN courses c ON e.course_id = c.course_id LEFT JOIN users u ON c.teacher_id = u.user_id WHERE e.user_id = ? ORDER BY c.course_id DESC`,
        [userId], (err, result) => {
          if (err) return res.status(500).json({ message: "Error fetching enrolled courses" });
          res.json(result);
        }
      );
    } else if (role === "teacher") {
      db.execute("SELECT * FROM courses WHERE teacher_id = ? ORDER BY course_id DESC", [userId], (err, result) => {
        if (err) return res.status(500).json({ message: "Error fetching teacher courses" });
        res.json(result);
      });
    } else {
      res.status(400).json({ message: "Invalid role query parameter" });
    }
  } catch (error) { next(error); }
});

// ================= EDIT COURSE =================
router.put("/edit-course/:courseId", upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "preview_video", maxCount: 1 }]), (req, res) => {
  const { courseId } = req.params;
  const { title, description, price, level, category } = req.body;
  db.query("SELECT thumbnail, preview_video FROM courses WHERE course_id = ?", [courseId], (err, existing) => {
    if (err || existing.length === 0) return res.status(404).json({ message: "Course not found" });
    const thumbnail = req.files?.thumbnail?.[0]?.filename || existing[0].thumbnail;
    const preview_video = req.files?.preview_video?.[0]?.filename || existing[0].preview_video;
    const coursePrice = parseFloat(price) || 0;
    const courseType = coursePrice > 0 ? "paid" : "free";
    db.query(
      `UPDATE courses SET title=?, description=?, price=?, level=?, category=?, thumbnail=?, preview_video=?, type=? WHERE course_id=?`,
      [title, description, coursePrice, level, category || null, thumbnail, preview_video, courseType, courseId],
      (err2) => {
        if (err2) return res.status(500).json({ message: "Failed to update course" });
        res.json({ message: "Course updated successfully", thumbnail, preview_video });
      }
    );
  });
});

// ================= DELETE COURSE =================
router.delete("/delete-course/:courseId", (req, res) => {
  db.query("DELETE FROM courses WHERE course_id = ?", [req.params.courseId], (err) => {
    if (err) return res.status(500).json({ message: "Failed to delete course" });
    res.json({ message: "Course deleted successfully" });
  });
});

// ================= ENROLL =================
router.post("/enroll", (req, res) => {
  const { user_id, course_id } = req.body;
  if (!user_id || !course_id) return res.status(400).json({ message: "user_id and course_id are required" });
  db.query("SELECT role FROM users WHERE user_id = ?", [user_id], (err, userRows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (userRows.length === 0) return res.status(400).json({ message: "User not found" });
    if (String(userRows[0].role).toLowerCase() !== "student") return res.status(403).json({ message: "Only students can enroll in courses" });
    db.query("SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?", [user_id, course_id], (err2, existing) => {
      if (err2) return res.status(500).json({ message: "DB error" });
      if (existing.length > 0) return res.status(400).json({ message: "Already enrolled" });
      db.query("INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)", [user_id, course_id], (err3) => {
        if (err3) return res.status(500).json({ message: "Enrollment failed" });
        res.json({ message: "Enrolled successfully" });
      });
    });
  });
});

// ================= STATS =================
router.get("/stats", (req, res) => {
  db.query(`SELECT (SELECT COUNT(*) FROM users WHERE role = 'student') AS totalStudents, (SELECT COUNT(*) FROM courses) AS totalCourses, (SELECT COUNT(*) FROM users WHERE role = 'teacher') AS totalTeachers`, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch stats" });
    res.json(results[0]);
  });
});

// ================= REVIEWS =================
router.get("/course/:courseId/reviews", (req, res) => {
  const { courseId } = req.params;
  db.query(`SELECT r.*, u.name, u.profilePhoto as avatar FROM reviews r JOIN users u ON r.user_id = u.user_id WHERE r.course_id = ? ORDER BY r.created_at DESC`, [courseId], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch reviews" });
    res.json(results);
  });
});

router.post("/course/:courseId/reviews", (req, res) => {
  const { courseId } = req.params;
  const { user_id, rating, title, body } = req.body;
  if (!user_id || !rating || !title) return res.status(400).json({ message: "Missing required fields" });
  db.query("SELECT * FROM reviews WHERE course_id = ? AND user_id = ?", [courseId, user_id], (err, existing) => {
    if (err) return res.status(500).json({ message: "DB Error" });
    if (existing.length > 0) return res.status(400).json({ message: "You have already reviewed this course" });
    db.query("INSERT INTO reviews (course_id, user_id, rating, title, body) VALUES (?, ?, ?, ?, ?)", [courseId, user_id, rating, title, body], (insertErr, result) => {
      if (insertErr) return res.status(500).json({ message: "Failed to submit review" });
      res.json({ message: "Review submitted successfully", reviewId: result.insertId });
    });
  });
});

// ================= MULTER ERROR HANDLER =================
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ message: "File too large. Max 500MB allowed." });
    return res.status(400).json({ message: err.message });
  }
  if (err) return res.status(400).json({ message: err.message });
  next();
});

module.exports = router;