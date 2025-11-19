const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

/**
 * @route   POST api/auth/register
 * @desc    Register user baru
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User dengan email ini sudah terdaftar' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User berhasil dibuat',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        totalPoints: user.totalPoints,
        level: user.level,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password harus diisi' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        totalPoints: user.totalPoints,
        level: user.level,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST api/auth/forgot
 * @desc    Kirim email reset password
 * @access  Public
 */
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User dengan email ini tidak ditemukan' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 menit

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset.html?token=${resetToken}`;
    const message = `
      <h2>Reset Password EcoHabit</h2>
      <p>Anda menerima email ini karena Anda (atau orang lain) meminta reset password untuk akun EcoHabit Anda.</p>
      <p>Klik link di bawah untuk reset password:</p>
      <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      <p>Link ini akan kadaluarsa dalam 10 menit.</p>
      <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
    `;

    await sendEmail(user.email, 'Reset Password - EcoHabit', message);

    res.json({ message: 'Email reset password telah dikirim' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST api/auth/reset/:token
 * @desc    Reset password menggunakan token
 * @access  Public
 */
router.post('/reset/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password berhasil direset' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
