const express = require('express');
const auth = require('../middleware/auth');
const Progress = require('../models/Progress');
const User = require('../models/User');

const router = express.Router();

// Dapatkan progress user
router.get('/', auth, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const progress = await Progress.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    // Format data untuk chart
    const chartData = progress.map(p => ({
      date: p.date.toISOString().split('T')[0],
      points: p.dailyPoints
    }));

    res.json({
      progress,
      chartData,
      totalPoints: req.user.totalPoints,
      level: req.user.level
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update progress (tambah aktivitas)
router.post('/update', auth, async (req, res) => {
  try {
    const { activityName, points } = req.body;

    // Cari progress hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let progress = await Progress.findOne({
      user: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    });

    // Jika belum ada progress hari ini, buat baru
    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        activities: [],
        dailyPoints: 0
      });
    }

    // Tambah aktivitas
    progress.activities.push({
      name: activityName,
      points: points,
      completed: true,
      completedAt: new Date()
    });

    // Update daily points
    progress.dailyPoints += points;

    await progress.save();

    // Update total points user
    const user = await User.findById(req.user._id);
    user.totalPoints += points;
    user.updateLevel(); // Update level berdasarkan total points
    await user.save();

    res.json({
      progress,
      totalPoints: user.totalPoints,
      level: user.level,
      message: `+${points} poin untuk ${activityName}!`
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
