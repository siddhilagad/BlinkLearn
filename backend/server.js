const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// ✅ Auto-create uploads folder if missing
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("uploads folder created ✅");
}

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= DATABASE =================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Sanika@123",
  database: "blinklearn",
});

db.connect((err) => {
  if (err) {
    console.log("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// ================= MULTER CONFIG =================
// ✅ Accepts both images (thumbnail) and videos (preview_video)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) +
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
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
});

// ================= REGISTER =================
app.post("/register", (req, res) => {
  const { fullname, email, password, accountType } = req.body;

  const role = accountType?.toLowerCase();
  if (!["student", "teacher"].includes(role)) {
    return res.status(400).json({ message: "Invalid account type" });
  }

  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
  db.query(sql, [fullname, email, password, role], (err) => {
    if (err) {
      console.log("Registration error:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Email already exists" });
      }
      return res.status(500).json({ message: "Registration failed" });
    }
    res.json({ message: "User registered successfully" });
  });
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json({ message: "Login failed" });
    if (result.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      message: "Login successful",
      user: result[0],
    });
  });
});

// ================= ADD COURSE =================
// ✅ Now accepts thumbnail + preview_video
app.post(
  "/add-course",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "preview_video", maxCount: 1 },
  ]),
  (req, res) => {
    console.log("✅ /add-course hit");
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    const { title, description, price, level, category, teacher_id } = req.body;

    if (!teacher_id) {
      return res.status(400).json({ message: "teacher_id is missing" });
    }
    if (!title || !description || price === undefined || !level) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const thumbnail = req.files?.thumbnail?.[0]?.filename || null;
    const preview_video = req.files?.preview_video?.[0]?.filename || null;

    if (!thumbnail) {
      return res.status(400).json({ message: "Thumbnail is required" });
    }

    const coursePrice = parseFloat(price) || 0;
    const courseType = coursePrice > 0 ? "paid" : "free";

    const sql = `
      INSERT INTO courses 
        (title, description, price, level, category, thumbnail, preview_video, teacher_id, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        title,
        description,
        coursePrice,
        level,
        category || null,
        thumbnail,
        preview_video,
        teacher_id,
        courseType,
      ],
      (err, result) => {
        if (err) {
          console.log("❌ DB Error:", err);
          return res.status(500).json({
            message: "Course add failed",
            error: err.message,
          });
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
app.get("/courses", (req, res) => {
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

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log("Fetch courses error:", err);
      return res.status(500).json({ message: "Error fetching courses" });
    }
    res.json(result);
  });
});

// ================= GET SINGLE COURSE =================
app.get("/course/:courseId", (req, res) => {
  const { courseId } = req.params;

  const sql = `
    SELECT c.*, u.name AS tutor_name, u.email AS teacher_email
    FROM courses c
    LEFT JOIN users u ON c.teacher_id = u.user_id
    WHERE c.course_id = ?
  `;

  db.query(sql, [courseId], (err, result) => {
    if (err) {
      console.log("Fetch course error:", err);
      return res.status(500).json({ message: "Error fetching course" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(result[0]);
  });
});

// ================= GET TEACHER COURSES =================
app.get("/teacher-courses/:id", (req, res) => {
  const teacherId = req.params.id;

  const sql = `
    SELECT * FROM courses 
    WHERE teacher_id = ? 
    ORDER BY course_id DESC
  `;

  db.query(sql, [teacherId], (err, result) => {
    if (err) {
      console.log("Fetch teacher courses error:", err);
      return res.status(500).json({ message: "Error fetching teacher courses" });
    }
    res.json(result);
  });
});

// ================= EDIT COURSE =================
// ✅ New — supports updating thumbnail and preview_video
app.put(
  "/edit-course/:courseId",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "preview_video", maxCount: 1 },
  ]),
  (req, res) => {
    const { courseId } = req.params;
    const { title, description, price, level, category } = req.body;

    // Fetch existing files so we don't overwrite with null
    db.query(
      "SELECT thumbnail, preview_video FROM courses WHERE course_id = ?",
      [courseId],
      (err, existing) => {
        if (err || existing.length === 0) {
          return res.status(404).json({ message: "Course not found" });
        }

        const thumbnail =
          req.files?.thumbnail?.[0]?.filename || existing[0].thumbnail;
        const preview_video =
          req.files?.preview_video?.[0]?.filename || existing[0].preview_video;

        const coursePrice = parseFloat(price) || 0;
        const courseType = coursePrice > 0 ? "paid" : "free";

        const sql = `
          UPDATE courses 
          SET title=?, description=?, price=?, level=?, category=?,
              thumbnail=?, preview_video=?, type=?
          WHERE course_id=?
        `;

        db.query(
          sql,
          [
            title, description, coursePrice, level,
            category || null, thumbnail, preview_video,
            courseType, courseId,
          ],
          (err2) => {
            if (err2) {
              console.log("Edit course error:", err2);
              return res.status(500).json({ message: "Failed to update course" });
            }
            res.json({
              message: "Course updated successfully",
              thumbnail,
              preview_video,
            });
          }
        );
      }
    );
  }
);

// ================= DELETE COURSE =================
app.delete("/delete-course/:courseId/:teacherId", (req, res) => {
  const { courseId, teacherId } = req.params;

  const sql = "DELETE FROM courses WHERE course_id = ? AND teacher_id = ?";
  db.query(sql, [courseId, teacherId], (err) => {
    if (err) {
      console.log("Delete course error:", err);
      return res.status(500).json({ message: "Error deleting course" });
    }
    res.json({ message: "Course deleted successfully" });
  });
});

// ================= ENROLL =================
app.post("/enroll", (req, res) => {
  const { user_id, course_id } = req.body;

  if (!user_id || !course_id) {
    return res.status(400).json({ message: "user_id and course_id are required" });
  }

  // Check if already enrolled
  db.query(
    "SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?",
    [user_id, course_id],
    (err, existing) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (existing.length > 0) {
        return res.status(400).json({ message: "Already enrolled" });
      }

      db.query(
        "INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)",
        [user_id, course_id],
        (err2) => {
          if (err2) {
            console.log("Enroll error:", err2);
            return res.status(500).json({ message: "Enrollment failed" });
          }
          res.json({ message: "Enrolled successfully" });
        }
      );
    }
  );
});

// ================= SWITCH ROLE =================
app.put("/switch-role/:userId", (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["student", "teacher"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const sql = "UPDATE users SET role = ? WHERE user_id = ?";
  db.query(sql, [role, userId], (err) => {
    if (err) {
      console.log("Switch role error:", err);
      return res.status(500).json({ message: "Failed to switch role" });
    }
    res.json({ message: "Role switched successfully", role });
  });
});

// ================= MULTER ERROR HANDLER =================
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Max 500MB allowed." });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

// ================= SERVER =================
app.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server running on port 5000");
});