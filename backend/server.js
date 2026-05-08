require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const server = http.createServer(app);

// ================= SOCKET.IO =================
const onlineUsers = new Map();

const io = new Server(server, {
  cors: { origin: "http://localhost:3000" }
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("user_online", (userId) => {
    onlineUsers.set(socket.id, userId);
    io.emit("online_users", Array.from(onlineUsers.values()));
  });

  socket.on("join_group", () => {
    socket.join("group_chat");
  });

  socket.on("group_message", (data) => {
    const { sender_id, message, sender_name } = data;
    const sql = "INSERT INTO messages (sender_id, sender_name, message) VALUES (?, ?, ?)";
    db.query(sql, [sender_id, sender_name, message], (err, result) => {
      if (!err) {
        const msg = { id: result.insertId, sender_id, sender_name, message, created_at: new Date() };
        io.to("group_chat").emit("receive_group_message", msg);
      }
    });
  });

  socket.on("private_message", (data) => {
    const { sender_id, receiver_id, message, sender_name } = data;
    const sql = "INSERT INTO messages (sender_id, receiver_id, sender_name, message) VALUES (?, ?, ?, ?)";
    db.query(sql, [sender_id, receiver_id, sender_name, message], (err, result) => {
      if (!err) {
        const msg = { id: result.insertId, sender_id, receiver_id, sender_name, message, created_at: new Date() };
        for (let [socketId, uid] of onlineUsers.entries()) {
          if (uid === receiver_id || uid === sender_id) {
            io.to(socketId).emit("receive_private_message", msg);
          }
        }
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
    onlineUsers.delete(socket.id);
    io.emit("online_users", Array.from(onlineUsers.values()));
  });
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
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "YourPassword123",
  database: process.env.DB_NAME || "blinklearn",
});

db.connect((err) => {
  if (err) {
    console.log("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");

    db.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        lesson_id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        section_title VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'video',
        duration VARCHAR(50),
        description TEXT,
        video_url VARCHAR(255),
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `, (err) => { if (err) console.error("❌ Failed to ensure lessons table:", err); });

    db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT DEFAULT NULL,
        sender_name VARCHAR(255),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `, (err) => { if (err) console.error("❌ Failed to ensure messages table:", err); });

    db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        body TEXT,
        helpful INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `, (err) => { if (err) console.error("❌ Failed to ensure reviews table:", err); });
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
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
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

// ================= ONBOARDING =================
app.put("/api/onboarding-done/:userId", (req, res) => {
  const { userId } = req.params;
  db.query("UPDATE users SET onboarding_done = 1 WHERE user_id = ?", [userId], (err) => {
    if (err) return res.status(500).json({ message: "Failed to update onboarding status" });
    res.json({ message: "Onboarding completed successfully" });
  });
});

// ================= STUDENT STATS =================
app.get("/student-stats/:userId", (req, res) => {
  const { userId } = req.params;
  db.query("SELECT COUNT(*) AS totalEnrolled FROM enrollments WHERE user_id = ?", [userId], (err, enrollResult) => {
    if (err) return res.status(500).json({ message: "DB error" });
    const totalEnrolled = enrollResult[0].totalEnrolled;
    db.query("SELECT COUNT(*) AS wishlistCount FROM wishlist WHERE user_id = ?", [userId], (err2, wishResult) => {
      const wishlistCount = err2 ? 0 : wishResult[0].wishlistCount;
      res.json({ totalEnrolled, completedCourses: 0, streakDays: 0, wishlistCount });
    });
  });
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
  db.query("SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?", [userId, courseId], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ enrolled: result.length > 0 });
  });
});

// ================= CHAT ROUTES =================
app.get("/users", (req, res) => {
  db.query("SELECT user_id, name, role FROM users", (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching users" });
    res.json(result);
  });
});

app.get("/messages/group", (req, res) => {
  db.query("SELECT * FROM messages WHERE receiver_id IS NULL ORDER BY created_at ASC", (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching group messages" });
    res.json(result);
  });
});

app.get("/messages/private/:user1/:user2", (req, res) => {
  const { user1, user2 } = req.params;
  const sql = `
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
  `;
  db.query(sql, [user1, user2, user2, user1], (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching private messages" });
    res.json(result);
  });
});

// ================= MOUNT AUTH ROUTES =================
const authRoutes = require("./src/routes/authRoutes");
app.use("/api/auth", authRoutes);

// ================= MOUNT COURSE ROUTES =================
const courseRoutes = require("./src/routes/courseRoutes");
app.use("/api", courseRoutes);

app.get('/api/course/:courseId/lessons', (req, res) => {
  db.query(
    'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC',
    [req.params.courseId],
    (err, rows) => {
      if (err) {
        console.error("Lessons fetch error:", err);
        return res.status(500).json({ message: "Failed to fetch lessons" });
      }
      res.json(rows);
    }
  );
});

// ================= TEACHER RATING ROUTES =================
// ✅ check आधी — नाहीतर /:teacherId त्याला catch करतो
app.get("/api/teacher-rating/check/:teacherId/:studentId", (req, res) => {
  const { teacherId, studentId } = req.params;
  db.query(
    "SELECT rating FROM teacher_ratings WHERE teacher_id = ? AND student_id = ?",
    [teacherId, studentId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (result.length > 0) res.json({ rated: true, rating: result[0].rating });
      else res.json({ rated: false });
    }
  );
});

// ✅ avg rating — check च्या नंतर
app.get("/api/teacher-rating/:teacherId", (req, res) => {
  const sql = `
    SELECT ROUND(AVG(rating), 1) AS avgRating, COUNT(id) AS totalRatings
    FROM teacher_ratings
    WHERE teacher_id = ?
  `;
  db.query(sql, [req.params.teacherId], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({
      avgRating: result[0].avgRating || 0,
      totalRatings: result[0].totalRatings || 0
    });
  });
});

// ✅ POST rating
app.post("/api/teacher-rating", (req, res) => {
  const { teacher_id, student_id, rating } = req.body;
  db.query(
    "INSERT INTO teacher_ratings (teacher_id, student_id, rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?",
    [teacher_id, student_id, rating, rating],
    (err) => {
      if (err) return res.status(500).json({ message: "Rating failed" });
      res.json({ message: "Rating submitted" });
    }
  );
});

// ================= SERVER =================
server.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server running on port 5000");
});