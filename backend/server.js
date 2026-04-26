const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app); // ✅ wrap express with http server

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" }
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("❌ Socket disconnected:", socket.id));
});

// ================= UPLOADS FOLDER =================
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("uploads folder created ✅");
}

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.set("db", db);

// ================= REGISTER =================
app.post("/register", (req, res) => {
  const { fullname, email, password, accountType } = req.body;
  const role = accountType?.toLowerCase();
  if (!["student", "teacher"].includes(role))
    return res.status(400).json({ message: "Invalid account type" });

  db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [fullname, email, password, role],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(400).json({ message: "Email already exists" });
        return res.status(500).json({ message: "Registration failed" });
      }
      res.json({ message: "User registered successfully" });
    }
  );
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Login failed" });
      if (result.length === 0)
        return res.status(401).json({ message: "Invalid credentials" });
      res.json({ message: "Login successful", user: result[0] });
    }
  );
});

// ================= UPLOAD PROFILE PHOTO =================
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const profileUpload = multer({ storage: profileStorage });

app.post("/upload-profile-photo", profileUpload.single("profilePhoto"), (req, res) => {
  const { user_id } = req.body;
  const photo = req.file?.filename;
  if (!photo) return res.status(400).json({ message: "No photo uploaded" });
  db.query("UPDATE users SET profilePhoto = ? WHERE user_id = ?", [photo, user_id], (err) => {
    if (err) return res.status(500).json({ message: "Failed to save photo" });
    res.json({ profilePhoto: photo });
  });
});

// ================= SWITCH ROLE =================
app.put("/switch-role/:userId", (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  if (!["student", "teacher"].includes(role))
    return res.status(400).json({ message: "Invalid role" });
  db.query("UPDATE users SET role = ? WHERE user_id = ?", [role, userId], (err) => {
    if (err) return res.status(500).json({ message: "Failed to switch role" });
    res.json({ message: "Role switched successfully", role });
  });
});

// ================= STUDENT STATS =================
app.get("/student-stats/:userId", (req, res) => {
  const { userId } = req.params;
  db.query(
    "SELECT COUNT(*) AS totalEnrolled FROM enrollments WHERE user_id = ?",
    [userId],
    (err, enrollResult) => {
      if (err) return res.status(500).json({ message: "DB error" });
      const totalEnrolled = enrollResult[0].totalEnrolled;
      db.query(
        "SELECT COUNT(*) AS wishlistCount FROM wishlist WHERE user_id = ?",
        [userId],
        (err2, wishResult) => {
          const wishlistCount = err2 ? 0 : wishResult[0].wishlistCount;
          res.json({ totalEnrolled, completedCourses: 0, streakDays: 0, wishlistCount });
        }
      );
    }
  );
});

// ================= TEACHER STUDENTS =================
app.get("/teacher-students/:teacherId", (req, res) => {
  const sql = `
    SELECT COUNT(DISTINCT e.user_id) AS totalStudents
    FROM enrollments e
    JOIN courses c ON e.course_id = c.course_id
    WHERE c.teacher_id = ?
  `;
  db.query(sql, [req.params.teacherId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching students" });
    res.json({ totalStudents: result[0].totalStudents });
  });
});

// ================= CHECK ENROLLMENT =================
app.get("/check-enrollment/:userId/:courseId", (req, res) => {
  const { userId, courseId } = req.params;
  db.query(
    "SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?",
    [userId, courseId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ enrolled: result.length > 0 });
    }
  );
});

// ================= MOUNT COURSE ROUTES =================
const courseRoutes = require("./src/routes/courseRoutes");
app.use("/api", courseRoutes);

// ================= SERVER =================
// ✅ Use server.listen (not app.listen) so Socket.io works
server.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server running on port 5000");
});