const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes'); // ✅ ADD THIS

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded thumbnails as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // ✅ ADD THIS

app.use('/api/auth', authRoutes);
app.use('/api', courseRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});