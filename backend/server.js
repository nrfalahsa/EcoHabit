const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecohabit';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Terhubung ke MongoDB'))
.catch(err => {
  console.error('❌ Koneksi MongoDB gagal:', err.message);
  console.log('📝 Menggunakan MongoDB lokal...');
  
  mongoose.connect('mongodb://localhost:27017/ecohabit', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Terhubung ke MongoDB lokal'))
  .catch(err => console.error('❌ Koneksi MongoDB lokal juga gagal:', err.message));
});

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
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

