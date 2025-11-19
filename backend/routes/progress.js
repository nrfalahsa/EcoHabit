const express = require('express');
const auth = require('../middleware/auth');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Activity = require('../models/Activity'); 
const { checkAndAwardBadges } = require('../utils/badgeManager');

const router = express.Router();

/**
 * @route   GET api/progress
 * @desc    Dapatkan progress user selama 7 hari terakhir beserta data chart
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const progress = await Progress.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    const chartData = progress.map(p => ({
      date: p.date.toISOString().split('T')[0],
      points: p.dailyPoints
    }));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayProgress = await Progress.findOne({
      user: req.user._id,
      date: { $gte: today }
    });

    res.json({
      progress,
      chartData,
      todayProgress: todayProgress ? todayProgress.activities : [], 
      totalPoints: req.user.totalPoints,
      level: req.user.level,
      badges: req.user.badges
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST api/progress/update
 * @desc    Memperbarui progress user dengan aktivitas baru
 * @access  Private
 */
router.post('/update', auth, async (req, res) => {
  try {
    const { activityName } = req.body;
    const activity = await Activity.findOne({ name: activityName });
    if (!activity) {
      return res.status(404).json({ message: 'Aktivitas tidak ditemukan' });
    }

    const points = activity.points;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let progress = await Progress.findOne({
      user: req.user._id,
      date: { $gte: today }
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        activities: [],
        dailyPoints: 0
      });
    }

    const activityExists = progress.activities.some(act => act.name === activityName);
    if (activityExists) {
      return res.status(400).json({ message: 'Aktivitas sudah dicatat hari ini' });
    }

    progress.activities.push({
      name: activityName,
      points: points,
      completed: true,
      completedAt: new Date()
    });

    progress.dailyPoints += points;
    await progress.save();

    const user = await User.findById(req.user._id);

    user.totalPoints += activity.points;

    user.totalCo2 += activity.impact_co2_kg || 0;
    user.totalWater += activity.impact_water_liter || 0;
    user.totalPlastic += activity.impact_plastic_gram || 0;

    user.updateLevel();
    
    const newBadges = checkAndAwardBadges(user);

    await user.save();

    res.json({
      progress,
      totalPoints: user.totalPoints,
      level: user.level,
      badges: user.badges, 
      newBadges: newBadges, 
      message: `+${activity.points} poin untuk ${activityName}!`
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/progress/savings
 * @desc    Dapatkan total penghematan CO2, air, dan plastik dari semua progress user
 * @access  Private
 */
router.get('/savings', auth, async (req, res) => {
  try {
    const activities = await Activity.find();
    const activityMap = new Map(activities.map(act => [act.name, act]));

    const allProgress = await Progress.find({ user: req.user._id });

    let total_co2_kg = 0;
    let total_water_liter = 0;
    let total_plastic_gram = 0;

    for (const record of allProgress) {
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