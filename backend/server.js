const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const Razorpay = require("razorpay");
const Stripe = require("stripe");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// ✅ Auto-create uploads folder
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("uploads folder created ✅");
}

// ================= MIDDLEWARE =================
app.use(cors());

// ⚠️ Stripe webhook needs raw body — must be BEFORE express.json()
app.use("/payment/stripe/webhook", express.raw({ type: "application/json" }));

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

    // ✅ Auto-create tables if not exist
    db.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_cart (user_id, course_id)
      )
    `);

    db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        payment_gateway VARCHAR(20),
        payment_id VARCHAR(100),
        order_id VARCHAR(100),
        status ENUM('pending','paid','failed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Tables checked/created");
  }
});

// ================= PAYMENT GATEWAYS =================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
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
  if (file.fieldname === "thumbnail" && imageTypes.test(ext)) cb(null, true);
  else if (file.fieldname === "preview_video" && videoTypes.test(ext)) cb(null, true);
  else cb(new Error(`Invalid file type for field: ${file.fieldname}`));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
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
      if (err.code === "ER_DUP_ENTRY")
        return res.status(400).json({ message: "Email already exists" });
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
    res.json({ message: "Login successful", user: result[0] });
  });
});

// ================= ADD COURSE =================
app.post(
  "/add-course",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "preview_video", maxCount: 1 },
  ]),
  (req, res) => {
    console.log("✅ /add-course hit");
    const { title, description, price, level, category, teacher_id } = req.body;
    if (!teacher_id) return res.status(400).json({ message: "teacher_id is missing" });
    if (!title || !description || price === undefined || !level)
      return res.status(400).json({ message: "All required fields must be filled" });

    const thumbnail = req.files?.thumbnail?.[0]?.filename || null;
    const preview_video = req.files?.preview_video?.[0]?.filename || null;
    if (!thumbnail) return res.status(400).json({ message: "Thumbnail is required" });

    const coursePrice = parseFloat(price) || 0;
    const courseType = coursePrice > 0 ? "paid" : "free";

    const sql = `INSERT INTO courses 
      (title, description, price, level, category, thumbnail, preview_video, teacher_id, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      sql,
      [title, description, coursePrice, level, category || null,
        thumbnail, preview_video, teacher_id, courseType],
      (err, result) => {
        if (err) {
          console.log("❌ DB Error:", err);
          return res.status(500).json({ message: "Course add failed", error: err.message });
        }
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
  let sql = `SELECT c.*, u.name AS tutor_name FROM courses c LEFT JOIN users u ON c.teacher_id = u.user_id`;
  const params = [];
  if (search) {
    sql += " WHERE c.title LIKE ? OR c.description LIKE ?";
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += " ORDER BY c.course_id DESC";
  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching courses" });
    res.json(result);
  });
});

// ================= GET SINGLE COURSE =================
app.get("/course/:courseId", (req, res) => {
  const { courseId } = req.params;
  const sql = `SELECT c.*, u.name AS tutor_name, u.email AS teacher_email
    FROM courses c LEFT JOIN users u ON c.teacher_id = u.user_id
    WHERE c.course_id = ?`;
  db.query(sql, [courseId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching course" });
    if (result.length === 0) return res.status(404).json({ message: "Course not found" });
    res.json(result[0]);
  });
});

// ================= GET TEACHER COURSES =================
app.get("/teacher-courses/:id", (req, res) => {
  const teacherId = req.params.id;
  db.query(
    "SELECT * FROM courses WHERE teacher_id = ? ORDER BY course_id DESC",
    [teacherId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error fetching teacher courses" });
      res.json(result);
    }
  );
});

// ================= EDIT COURSE =================
app.put(
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
        const thumbnail = req.files?.thumbnail?.[0]?.filename || existing[0].thumbnail;
        const preview_video = req.files?.preview_video?.[0]?.filename || existing[0].preview_video;
        const coursePrice = parseFloat(price) || 0;
        const courseType = coursePrice > 0 ? "paid" : "free";
        db.query(
          `UPDATE courses SET title=?, description=?, price=?, level=?, category=?, thumbnail=?, preview_video=?, type=? WHERE course_id=?`,
          [title, description, coursePrice, level, category || null,
            thumbnail, preview_video, courseType, courseId],
          (err2) => {
            if (err2) return res.status(500).json({ message: "Failed to update course" });
            res.json({ message: "Course updated successfully", thumbnail, preview_video });
          }
        );
      }
    );
  }
);

// ================= DELETE COURSE =================
app.delete("/delete-course/:courseId/:teacherId", (req, res) => {
  const { courseId, teacherId } = req.params;
  db.query(
    "DELETE FROM courses WHERE course_id = ? AND teacher_id = ?",
    [courseId, teacherId],
    (err) => {
      if (err) return res.status(500).json({ message: "Error deleting course" });
      res.json({ message: "Course deleted successfully" });
    }
  );
});

// ================= ENROLL =================
app.post("/enroll", (req, res) => {
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
          if (err2) return res.status(500).json({ message: "Enrollment failed" });
          res.json({ message: "Enrolled successfully" });
        }
      );
    }
  );
});

// ================= ENROLL CHECK =================
app.get("/enroll/check", (req, res) => {
  const { user_id, course_id } = req.query;
  if (!user_id || !course_id)
    return res.json({ enrolled: false });

  db.query(
    "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?",
    [user_id, course_id],
    (err, result) => {
      if (err) return res.json({ enrolled: false });
      res.json({ enrolled: result.length > 0 });
    }
  );
});

// ================= CART — ADD =================
app.post("/cart/add", (req, res) => {
  const { user_id, course_id } = req.body;
  if (!user_id || !course_id)
    return res.status(400).json({ message: "user_id and course_id required" });

  db.query(
    "INSERT IGNORE INTO cart (user_id, course_id) VALUES (?, ?)",
    [user_id, course_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to add to cart", error: err.message });
      if (result.affectedRows === 0)
        return res.status(409).json({ message: "Already in cart" });
      res.json({ message: "Added to cart" });
    }
  );
});

// ================= CART — GET =================
app.get("/cart/:user_id", (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT 
      cart.id AS cart_id,
      courses.course_id,
      courses.title,
      courses.price,
      courses.thumbnail,
      courses.level,
      courses.type
    FROM cart
    JOIN courses ON cart.course_id = courses.course_id
    WHERE cart.user_id = ?
    ORDER BY cart.added_at DESC
  `;
  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to fetch cart", error: err.message });
    res.json(result);
  });
});

// ================= CART — REMOVE =================
app.delete("/cart/remove", (req, res) => {
  const { user_id, course_id } = req.body;
  if (!user_id || !course_id)
    return res.status(400).json({ message: "user_id and course_id required" });

  db.query(
    "DELETE FROM cart WHERE user_id = ? AND course_id = ?",
    [user_id, course_id],
    (err) => {
      if (err) return res.status(500).json({ message: "Failed to remove from cart" });
      res.json({ message: "Removed from cart" });
    }
  );
});

// ================= RAZORPAY — CREATE ORDER =================
app.post("/payment/razorpay/create-order", async (req, res) => {
  const { user_id, course_id, amount } = req.body;
  if (!user_id || !course_id || !amount)
    return res.status(400).json({ message: "user_id, course_id, amount required" });

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(parseFloat(amount) * 100), // paise
      currency: "INR",
      receipt: `rcpt_${user_id}_${course_id}_${Date.now()}`,
    });

    db.query(
      `INSERT INTO orders (user_id, course_id, amount, currency, payment_gateway, order_id, status)
       VALUES (?, ?, ?, 'INR', 'razorpay', ?, 'pending')`,
      [user_id, course_id, amount, order.id],
      (err) => {
        if (err) console.error("Order DB save error:", err);
      }
    );

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    res.status(500).json({ message: "Razorpay order creation failed", error: err.message });
  }
});

// ================= RAZORPAY — VERIFY =================
app.post("/payment/razorpay/verify", (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    user_id,
    course_id,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Payment verification failed — signature mismatch" });
  }

  // Mark order paid
  db.query(
    "UPDATE orders SET status = 'paid', payment_id = ? WHERE order_id = ?",
    [razorpay_payment_id, razorpay_order_id],
    (err) => { if (err) console.error("Order update error:", err); }
  );

  // Auto-enroll student
  db.query(
    "INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)",
    [user_id, course_id],
    (err) => { if (err) console.error("Enroll error:", err); }
  );

  // Remove from cart
  db.query(
    "DELETE FROM cart WHERE user_id = ? AND course_id = ?",
    [user_id, course_id],
    (err) => { if (err) console.error("Cart remove error:", err); }
  );

  res.json({ message: "Payment verified! Enrolled successfully." });
});

// ================= STRIPE — CREATE INTENT =================
app.post("/payment/stripe/create-intent", async (req, res) => {
  const { user_id, course_id, amount } = req.body;
  if (!user_id || !course_id || !amount)
    return res.status(400).json({ message: "user_id, course_id, amount required" });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(amount) * 100), // paise/cents
      currency: "inr",
      metadata: {
        user_id: String(user_id),
        course_id: String(course_id),
      },
    });

    db.query(
      `INSERT INTO orders (user_id, course_id, amount, currency, payment_gateway, order_id, status)
       VALUES (?, ?, ?, 'INR', 'stripe', ?, 'pending')`,
      [user_id, course_id, amount, paymentIntent.id],
      (err) => { if (err) console.error("Stripe order DB error:", err); }
    );

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe create-intent error:", err);
    res.status(500).json({ message: "Stripe payment intent failed", error: err.message });
  }
});

// ================= STRIPE — WEBHOOK =================
app.post("/payment/stripe/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const { user_id, course_id } = intent.metadata;

    db.query(
      "UPDATE orders SET status = 'paid', payment_id = ? WHERE order_id = ?",
      [intent.id, intent.id],
      (err) => { if (err) console.error("Stripe order update error:", err); }
    );

    db.query(
      "INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)",
      [user_id, course_id],
      (err) => { if (err) console.error("Stripe enroll error:", err); }
    );

    db.query(
      "DELETE FROM cart WHERE user_id = ? AND course_id = ?",
      [user_id, course_id],
      (err) => { if (err) console.error("Stripe cart remove error:", err); }
    );
  }

  res.json({ received: true });
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

// ================= GET ALL USERS =================
app.get("/users", (req, res) => {
  const sql = "SELECT user_id, name, email, role FROM users ORDER BY name ASC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching users" });
    res.json(result);
  });
});

// ================= PRIVATE MESSAGES =================
app.get("/messages/private/:userId/:otherUserId", (req, res) => {
  const { userId, otherUserId } = req.params;
  const sql = `
    SELECT m.*, u.name AS sender_name 
    FROM messages m
    JOIN users u ON m.sender_id = u.user_id
    WHERE (m.sender_id = ? AND m.receiver_id = ?)
       OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at ASC
  `;
  db.query(sql, [userId, otherUserId, otherUserId, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching messages" });
    res.json(result);
  });
});

// ================= GROUP MESSAGES =================
app.get("/messages/group", (req, res) => {
  const sql = `
    SELECT m.*, u.name AS sender_name 
    FROM messages m
    JOIN users u ON m.sender_id = u.user_id
    WHERE m.is_group = 1
    ORDER BY m.created_at ASC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching group messages" });
    res.json(result);
  });
});

// ================= SOCKET.IO =================
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("user_online", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("online_users", Object.keys(onlineUsers));
  });

  socket.on("join_group", () => {
    socket.join("group_chat");
  });

  socket.on("private_message", ({ sender_id, receiver_id, message, sender_name }) => {
    const sql = `INSERT INTO messages (sender_id, receiver_id, message, is_group) VALUES (?, ?, ?, 0)`;
    db.query(sql, [sender_id, receiver_id, message], (err, result) => {
      if (err) return console.error("Save private msg error:", err);
      const msgData = {
        id: result.insertId,
        sender_id, receiver_id, message, sender_name,
        is_group: 0,
        created_at: new Date(),
      };
      const receiverSocket = onlineUsers[receiver_id];
      if (receiverSocket) io.to(receiverSocket).emit("receive_private_message", msgData);
      socket.emit("receive_private_message", msgData);
    });
  });

  socket.on("group_message", ({ sender_id, message, sender_name }) => {
    const sql = `INSERT INTO messages (sender_id, message, is_group) VALUES (?, ?, 1)`;
    db.query(sql, [sender_id, message], (err, result) => {
      if (err) return console.error("Save group msg error:", err);
      const msgData = {
        id: result.insertId,
        sender_id, message, sender_name,
        is_group: 1,
        created_at: new Date(),
      };
      io.to("group_chat").emit("receive_group_message", msgData);
    });
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of Object.entries(onlineUsers)) {
      if (socketId === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
    io.emit("online_users", Object.keys(onlineUsers));
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// ================= MULTER ERROR HANDLER =================
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE")
      return res.status(400).json({ message: "File too large. Max 500MB." });
    return res.status(400).json({ message: err.message });
  }
  if (err) return res.status(400).json({ message: err.message });
  next();
});

// ================= START SERVER =================
server.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server running on port 5000");
});