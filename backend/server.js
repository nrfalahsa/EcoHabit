require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { connectDB } = require('./config/db');
const corsOptions = require('./config/cors');

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.set('json spaces', 2);

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/users', require('./routes/users'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/impact', require('./routes/impact'));
app.use('/api/upload', require('./routes/upload'));

/**
 * @route   GET api
 * @desc    Cek apakah API berjalan
 * @access  Public
 */
app.get('/api', (req, res) => {
  res.json({ 
    message: 'EcoHabit API berjalan!',
    database: mongoose.connection.readyState === 1 ? 'Terhubung' : 'Terputus'
  });
});

/**
 * @route   GET api/health
 * @desc    Cek status kesehatan server dan database
 * @access  Public
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

