const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')

router.use(auth);

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * @route   POST api/ai/analyze-impact
 * @desc    Menganalisis dampak lingkungan menjadi analogi (Manual dengan variasi acak)
 * @access  Private
 */
router.post('/analyze-impact', async (req, res) => {
  try {
    const { total_co2_kg, total_water_liter, total_plastic_gram } = req.body;
 
    const co2_val = parseFloat(total_co2_kg) || 0;
    const water_val = parseFloat(total_water_liter) || 0;
    const plastic_val = parseFloat(total_plastic_gram) || 0;

    let co2Analogy, waterAnalogy, plasticAnalogy;

    // --- LOGIKA ANALOGI KARBON (CO2) ---
    // Estimasi: 1 kg CO2 diserap 1 pohon dalam ~2 hari.
    if (co2_val > 0) {
      const co2_days = Math.max(1, Math.round(co2_val * 2));
      const co2Analogies = [
        `Setara dengan ${co2_days} hari penyerapan CO2 oleh satu pohon dewasa, menjaga udara tetap segar.`,
        `Dampak positif Anda setara dengan oksigen yang dihasilkan ${co2_days} hari oleh sebuah pohon. Luar biasa!`,
        `Penghematan CO2 Anda setara dengan beban karbon yang diserap pohon selama ${co2_days} hari.`,
      ];
      co2Analogy = getRandomElement(co2Analogies);
    } else {
      co2Analogy = "Mulai catat aktivitasmu untuk melihat dampak CO2 yang kamu tekan!";
    }

    // --- LOGIKA ANALOGI AIR (Liter) ---
    // Estimasi: Rata-rata mandi cepat menggunakan ~15 liter air.
    if (water_val > 0) {
      const water_showers = Math.max(1, Math.floor(water_val / 15));
      const waterAnalogies = [
        `Penghematan ini cukup untuk ${water_showers} kali mandi, menunjukkan betapa berharganya setiap tetes air.`,
        `Air yang Anda hemat setara dengan kebutuhan minum ${water_showers * 2} orang per hari. Terus lakukan yang terbaik!`,
        `Setara dengan mengisi penuh ${water_showers} ember besar. Anda pahlawan air sejati!`,
      ];
      waterAnalogy = getRandomElement(waterAnalogies);
    } else {
      waterAnalogy = "Mulai catat aktivitasmu untuk melihat jumlah air yang kamu hemat!";
    }

    // --- LOGIKA ANALOGI PLASTIK (Gram) ---
    // Estimasi: 1 botol plastik air minum sekali pakai setara ~20 gram.
    if (plastic_val > 0) {
      const plastic_bottles = Math.max(1, Math.floor(plastic_val / 20));
      const plasticAnalogies = [
        `Anda telah mengurangi sampah plastik setara ${plastic_bottles} botol air minum sekali pakai dari lingkungan.`,
        `Bayangkan ${plastic_bottles} botol plastik yang tidak berakhir di laut. Itu semua berkat Anda!`,
        `Pengurangan ini setara dengan menghilangkan ${plastic_bottles} buah kantong kresek ukuran sedang.`,
      ];
      plasticAnalogy = getRandomElement(plasticAnalogies);
    } else {
      plasticAnalogy = "Mulai catat aktivitasmu untuk melihat jumlah plastik yang kamu kurangi!";
    }

    res.json({ co2Analogy, waterAnalogy, plasticAnalogy });

  } catch (error) {
    console.error('Manual analyze impact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;