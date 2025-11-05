const express = require('express');
const Quote = require('../models/Quote');

const router = express.Router();

// Dapatkan quote random
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

// Seed quotes (untuk development)
router.post('/seed', async (req, res) => {
  try {
    const quotes = [
      {
        text: "Bumi tidak warisan dari nenek moyang kita, tapi pinjaman untuk anak cucu kita.",
        author: "Peribahasa Indian"
      },
      {
        text: "Yang terbaik dari alam adalah ketika kita menjaganya.",
        author: "Anonymous"
      },
      {
        text: "Tidak ada planet B. Jadilah bagian dari solusi, bukan polusi.",
        author: "Anonymous"
      },
      {
        text: "Lingkungan yang sehat dimulai dengan kebiasaan yang sehat.",
        author: "EcoHabit"
      },
      {
        text: "Kecil-kecil jadi bukit, sedikit-sedikit jadi laut.",
        author: "Peribahasa Indonesia"
      }
    ];

    await Quote.deleteMany({});
    await Quote.insertMany(quotes);

    res.json({ message: 'Quotes berhasil di-seed' });
  } catch (error) {
    console.error('Seed quotes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
