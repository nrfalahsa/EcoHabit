const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); 

/**
 * @route   GET api/users/leaderboard
 * @desc    Dapatkan leaderboard 5 user teratas berdasarkan totalPoints
 * @access  Private
 */
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const topUsers = await User.find()
      .sort({ totalPoints: -1 })
      .limit(5)
      .select('name totalPoints level profilePicture');

    res.json(topUsers);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT api/users/profile
 * @desc    Memperbarui profil user
 * @access  Private
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, profilePicture } = req.body;
    
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      totalPoints: user.totalPoints,
      level: user.level,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Gagal memperbarui profil' });
  }
});

/**
 * @route   PUT api/users/change-password
 * @desc    Mengubah password user
 * @access  Private
 */
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Mohon isi password saat ini dan password baru' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password saat ini salah' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Gagal mengubah password' });
  }
});

module.exports = router;