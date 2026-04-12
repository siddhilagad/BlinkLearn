const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "YourPassword123",  // ✅ तुझा password इथे द्या
  database: "blinklearn",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.log("❌ Database connection failed");
    console.log(err.message);
  } else {
    console.log("✅ Database connected successfully");
  }
});

module.exports = db;


