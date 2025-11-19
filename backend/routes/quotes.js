const express = require('express');
const Quote = require('../models/Quote');

const router = express.Router();

/**
 * @route   GET api/quotes/random
 * @desc    Dapatkan satu quote motivasi acak
 * @access  Public
 */
router.get('/random', async (req, res) => {
  try {
    const count = await Quote.countDocuments();
    const random = Math.floor(Math.random() * count);
    const quote = await Quote.findOne().skip(random);

    if (!quote) {
      return res.json({
        text: "Setiap tindakan kecil untuk lingkungan membawa perubahan besar untuk masa depan.",
        author: "EcoHabit"
      });
    }

    res.json(quote);
  } catch (error) {
    console.error('Get quote error:', error);
    res.json({
      text: "Jadilah perubahan yang ingin kamu lihat di dunia.",
      author: "Mahatma Gandhi"
    });
  }
});

module.exports = router;
