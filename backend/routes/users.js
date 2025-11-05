const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users/leaderboard
// @desc    Dapatkan pengguna dengan poin tertinggi
// @access  Private
router.get('/leaderboard', auth, async (req, res) => {
  try {
    // Cari 5 user, urutkan dari totalPoints tertinggi
    // Kita HANYA pilih field yang aman untuk ditampilkan
    const topUsers = await User.find()
      .sort({ totalPoints: -1 })
      .limit(5)
      .select('name totalPoints level'); // Hanya ambil field ini

    res.json(topUsers);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;