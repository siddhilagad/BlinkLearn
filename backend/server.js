const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

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

  const sql =
    "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length > 0) {
      res.json({ message: "Login successful", user: result[0] });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  });
});


// ================= ADD COURSE =================

app.post("/add-course", (req, res) => {
  const { title, description, price, level, thumbnail, user_id } = req.body;

  const sql = `
    INSERT INTO courses 
    (title, description, price, level, thumbnail, tutor_id) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, description, price, level, thumbnail, user_id],
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
  const sql = "SELECT * FROM courses";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching courses" });
    }

    res.json(result);
  });
});


app.listen(5000, () => {
  console.log("Server running on port 5000");
});