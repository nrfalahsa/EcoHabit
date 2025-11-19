const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');

/** 
* @route   GET api/activities
* @desc    Dapatkan semua daftar aktivitas
* @access  Private
*/
router.get('/', auth, async (req, res) => {
  try {
    const activities = await Activity.find().sort({ points: -1 });
    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;