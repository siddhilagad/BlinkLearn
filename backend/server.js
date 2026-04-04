const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // ✅ added

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
    console.log("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ================= REGISTER =================
app.post("/register", (req, res) => {
  let { fullname, email, password, accountType } = req.body;

  const role = accountType.toLowerCase();
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
    if (err) return res.status(500).json(err);
    if (result.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      message: "Login successful",
      user: result[0],
    });
  });
});

// ================= ADD COURSE =================
app.post("/api/courses/add-course", upload.single("thumbnail"), (req, res) => {
  console.log("Body:", req.body);
  console.log("File:", req.file);

  const { title, description, price, level, teacher_id } = req.body;

  if (!teacher_id) {
    return res.status(400).json({ message: "teacher_id is missing" });
  }

  const thumbnail = req.file ? req.file.filename : null;
  const coursePrice = parseFloat(price) || 0; // ✅ parseFloat for decimal
  const courseType = coursePrice > 0 ? "paid" : "free";

  const sql = `
    INSERT INTO courses 
    (title, description, price, level, thumbnail, teacher_id, type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [title, description, coursePrice, level, thumbnail, teacher_id, courseType], (err) => {
    if (err) {
      console.log("DB Error:", err);
      return res.status(500).json({ message: "Course add failed", error: err.message });
    }
    res.json({ message: "Course added successfully" });
  });
});

// ================= GET ALL COURSES =================
app.get("/courses", (req, res) => {
  const sql = "SELECT * FROM courses ORDER BY course_id DESC";
  db.query(sql, (err, result) => {
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
    SELECT c.*, u.name as teacher_name, u.email as teacher_email
    FROM courses c
    JOIN users u ON c.teacher_id = u.user_id
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
  const sql = "SELECT * FROM courses WHERE teacher_id = ? ORDER BY course_id DESC";

  db.query(sql, [teacherId], (err, result) => {
    if (err) {
      console.log("Fetch teacher courses error:", err);
      return res.status(500).json({ message: "Error fetching teacher courses" });
    }
    res.json(result);
  });
});

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

// ================= SWITCH ROLE =================
app.put("/switch-role/:userId", (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["student", "teacher"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  // ✅ Simple — only update role column
  const sql = "UPDATE users SET role = ? WHERE user_id = ?";

  db.query(sql, [role, userId], (err) => {
    if (err) {
      console.log("Switch role error:", err);
      return res.status(500).json({ message: "Failed to switch role" });
    }
    res.json({ message: "Role switched successfully", role });
  });
});

// ================= SERVER =================
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});