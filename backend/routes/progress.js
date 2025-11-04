const express = require('express');
const auth = require('../middleware/auth');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Activity = require('../models/Activity'); 
const { checkAndAwardBadges } = require('../utils/badgeManager');

const router = express.Router();

// ... (GET '/' tidak berubah) ...
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

    // Ambil juga data progress hari ini untuk UI
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayProgress = await Progress.findOne({
      user: req.user._id,
      date: { $gte: today }
    });

    res.json({
      progress,
      chartData,
      todayProgress: todayProgress ? todayProgress.activities : [], // Kirim aktivitas hari ini
      totalPoints: req.user.totalPoints,
      level: req.user.level,
      badges: req.user.badges
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Update progress (tambah aktivitas)
router.post('/update', auth, async (req, res) => {
  try {
    // 2. HANYA AMBIL NAMA AKTIVITAS DARI BODY
    const { activityName } = req.body;

    // 3. CARI DATA AKTIVITAS DI DATABASE
    const activity = await Activity.findOne({ name: activityName });
    if (!activity) {
      return res.status(404).json({ message: 'Aktivitas tidak ditemukan' });
    }
    
    // Ambil poin dari database
    const points = activity.points;

    // Cari progress hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let progress = await Progress.findOne({
      user: req.user._id,
      date: { $gte: today }
    });

    // Jika belum ada progress hari ini, buat baru
    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        activities: [],
        dailyPoints: 0
      });
    }

    // CEK agar aktivitas tidak duplikat di hari yang sama
    const activityExists = progress.activities.some(act => act.name === activityName);
    if (activityExists) {
      return res.status(400).json({ message: 'Aktivitas sudah dicatat hari ini' });
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

    // --- 3. LOGIKA BARU UNTUK USER ---
    const user = await User.findById(req.user._id);

    // Update total points
    user.totalPoints += activity.points;

    // Update total dampak (dari model Activity)
    user.totalCo2 += activity.impact_co2_kg || 0;
    user.totalWater += activity.impact_water_liter || 0;
    user.totalPlastic += activity.impact_plastic_gram || 0;

    // Update level
    user.updateLevel();
    
    // Cek dan berikan lencana baru
    const newBadges = checkAndAwardBadges(user);

    // Simpan semua perubahan user
    await user.save();

    res.json({
      progress,
      totalPoints: user.totalPoints,
      level: user.level,
      badges: user.badges, // Kirim daftar lencana terbaru
      newBadges: newBadges, // Kirim lencana yang BARU didapat
      message: `+${activity.points} poin untuk ${activityName}!`
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 4. ENDPOINT BARU UNTUK TOTAL DAMPAK
// @route   GET api/progress/savings
// @desc    Dapatkan total tabungan dampak (CO2, air, dll)
// @access  Private
router.get('/savings', auth, async (req, res) => {
  try {
    // Ambil semua data aktivitas sebagai referensi
    const activities = await Activity.find();
    const activityMap = new Map(activities.map(act => [act.name, act]));

    // Ambil SEMUA progress milik user
    const allProgress = await Progress.find({ user: req.user._id });

    let total_co2_kg = 0;
    let total_water_liter = 0;
    let total_plastic_gram = 0;

    // Loop setiap catatan progress (harian)
    for (const record of allProgress) {
      // Loop setiap aktivitas di dalam catatan harian
      for (const activity of record.activities) {
        const impact = activityMap.get(activity.name);
        
        if (impact) {
          total_co2_kg += impact.impact_co2_kg;
          total_water_liter += impact.impact_water_liter;
          total_plastic_gram += impact.impact_plastic_gram;
        }
      }
    }

    res.json({
      total_co2_kg: total_co2_kg.toFixed(2),
      total_water_liter: total_water_liter.toFixed(2),
      total_plastic_gram: total_plastic_gram.toFixed(2)
    });

  } catch (error) {
    console.error('Get savings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;