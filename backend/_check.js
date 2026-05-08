const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sanika@123',
  database: 'blinklearn',
});
db.connect((err) => {
  if (err) throw err;
  db.query('DESCRIBE enrollments', (err, rows) => {
    if (err) console.error('enrollments:', err.message);
    else console.log('enrollments:', JSON.stringify(rows, null, 2));
    
    db.query('SELECT * FROM lessons', (err2, rows2) => {
      if (err2) console.error('lessons data:', err2.message);
      else console.log('lessons data:', JSON.stringify(rows2, null, 2));
      process.exit(0);
    });
  });
});
