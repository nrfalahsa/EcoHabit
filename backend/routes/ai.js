const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { runGemini } = require('../utils/gemini');

router.use(auth);

/**
 * @route   POST api/ai/ask
 * @desc    Menjawab pertanyaan pengguna (Tanya Eco)
 * @access  Private
 */
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'Pertanyaan tidak boleh kosong' });
    }

    const prompt = `Anda adalah "Asisten Eco" yang ramah dan edukatif. Jawab pertanyaan pengguna tentang lingkungan atau kebiasaan ramah lingkungan berikut ini dengan jelas dan singkat (maksimal 3-4 kalimat): "${question}"`;
    
    const answer = await runGemini(prompt);
    res.json({ answer });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST api/ai/suggest
 * @desc    Menyarankan aktivitas baru
 * @access  Private
 */
router.post('/suggest', async (req, res) => {
  try {
    const { completedActivities } = req.body;
    const completedList = completedActivities.join(', ');

    const prompt = `Pengguna ini sudah sering melakukan aktivitas berikut: "${completedList}". Berikan 2 saran aktivitas ramah lingkungan LAIN (yang tidak ada di daftar itu) yang mungkin dia sukai, beserta alasan singkat (1 kalimat) kenapa aktivitas itu relevan. Format jawaban sebagai bullet point (gunakan tanda -).`;
    
    const suggestion = await runGemini(prompt);
    res.json({ suggestion });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;