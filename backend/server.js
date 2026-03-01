const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// 👇 VERY IMPORTANT LINE
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ================= DATABASE =================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "YourPassword123",
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
  const { fullname, email, password, accountType } = req.body;

  const role = accountType.toLowerCase();

  const sql =
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

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
    if (err) {
      console.log("Login error:", err);
      return res.status(500).json({ message: "Login failed" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: result[0],
    });
  });
});

// ================= ADD COURSE =================
app.post("/add-course", upload.single("thumbnail"), (req, res) => {
  const { title, description, price, level, user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "Tutor ID missing" });
  }

  const tutor_id = parseInt(user_id);

  if (isNaN(tutor_id)) {
    return res.status(400).json({ message: "Invalid Tutor ID" });
  }

  const thumbnail = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO courses 
    (title, description, price, level, thumbnail, tutor_id) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, description, price, level, thumbnail, tutor_id],
    (err) => {
      if (err) {
        console.log("Add Course Error:", err);
        return res.status(500).json({ message: "Error adding course" });
      }

      res.json({ message: "Course added successfully" });
    }
  );
});

// ================= GET COURSES =================
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

// ================= SERVER =================
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});