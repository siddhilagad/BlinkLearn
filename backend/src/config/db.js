// src/config/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST     || 'localhost',   
  user: process.env.DB_USER     || 'root',
  password: process.env.DB_PASS || 'Sanika@123',
  database: process.env.DB_NAME || 'blinklearn',
  // Optional but recommended in production:
  // connectTimeout: 10000,
  // multipleStatements: true,    // only if really needed
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    process.exit(1); // or handle gracefully depending on your preference
  } else {
    console.log(`Connected to MySQL - database: ${process.env.DB_NAME || 'blinklearn'}`);
  }
});

// Optional: Promise-based wrapper (cleaner in services)
db.promise = () => {
  return new Promise((resolve, reject) => {
    db.query(...arguments, (err, results, fields) => {
      if (err) return reject(err);
      resolve({ results, fields });
    });
  });
};

module.exports = db;