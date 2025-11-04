const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { runGemini } = require('../utils/gemini');

// Middleware autentikasi untuk semua rute AI
router.use(auth);

/**
 * @route   POST api/ai/motivation
 * @desc    Mendapatkan motivasi personal dari AI
 * @access  Private
 */
router.post('/motivation', async (req, res) => {
  try {
    const { name, level } = req.body;
    const prompt = `Berikan saya satu kutipan motivasi singkat (maksimal 2 kalimat) tentang lingkungan. Sapa pengguna dengan nama "${name}" dan sebutkan levelnya saat ini adalah "${level}". Buatlah terdengar personal dan menyemangati. Jangan gunakan tanda kutip di awal dan akhir jawabanmu.`;
    
    const motivationText = await runGemini(prompt);
    res.json({ text: motivationText, author: "Asisten Eco" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST api/ai/analyze-impact
 * @desc    Menganalisis dampak lingkungan menjadi analogi
 * @access  Private
 */
/**
 * @route   POST api/ai/analyze-impact
 * @desc    Menganalisis dampak lingkungan menjadi analogi
 * @access  Private
 */
router.post('/analyze-impact', async (req, res) => {
  try {
    // 1. Ambil data (yang merupakan string seperti "22.00")
    const { total_co2_kg, total_water_liter, total_plastic_gram } = req.body;

    // 2. PERBAIKAN: Konversi ke angka (float) lalu ke string lagi.
    //    Ini akan menghapus .00 yang tidak perlu dan membingungkan AI.
    //    parseFloat("22.00").toString() akan menjadi "22"
    //    parseFloat("4.40").toString() akan menjadi "4.4"
    const co2_val = parseFloat(total_co2_kg).toString();
    const water_val = parseFloat(total_water_liter).toString();
    const plastic_val = parseFloat(total_plastic_gram).toString();

    // 3. Gunakan nilai yang sudah bersih di prompt
    const co2Prompt = `Berikan analogi sederhana (1 kalimat) untuk penghematan ${co2_val} kg CO2. Contoh: 'setara mengisi daya smartphone X kali' atau 'setara pohon menyerap Y hari'.`;
    const waterPrompt = `Berikan analogi sederhana (1 kalimat) untuk penghematan ${water_val} liter air. Contoh: 'setara X kali mandi' atau 'cukup untuk minum Y orang'.`;
    const plasticPrompt = `Berikan analogi sederhana (1 kalimat) untuk pengurangan ${plastic_val} gram plastik. Contoh: 'setara X botol plastik' atau 'setara Y kantong kresek'.`;

    // Jalankan promise secara paralel
    const [co2Analogy, waterAnalogy, plasticAnalogy] = await Promise.all([
      runGemini(co2Prompt),
      runGemini(waterPrompt),
      runGemini(plasticPrompt)
    ]);

    res.json({ co2Analogy, waterAnalogy, plasticAnalogy });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
    const { completedActivities } = req.body; // Array of strings
    const completedList = completedActivities.join(', ');

    const prompt = `Pengguna ini sudah sering melakukan aktivitas berikut: "${completedList}". Berikan 2 saran aktivitas ramah lingkungan LAIN (yang tidak ada di daftar itu) yang mungkin dia sukai, beserta alasan singkat (1 kalimat) kenapa aktivitas itu relevan. Format jawaban sebagai bullet point (gunakan tanda -).`;
    
    const suggestion = await runGemini(prompt);
    res.json({ suggestion });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
