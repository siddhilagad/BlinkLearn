// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();           // ← add this if using .env

const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);     // better to prefix routes

// Optional: 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// register - /register
// login - /login

// http://localhost:500/register changes-> http://localhost:500/api/auth/register 
// http://localhost:500/login -> http://localhost:500/api/auth/login