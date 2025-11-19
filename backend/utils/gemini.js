const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Menjalankan prompt ke model Gemini
 * @param {string} prompt Teks prompt
 * @returns {Promise<string>} Teks respons dari AI
 */
async function runGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Gagal berkomunikasi dengan AI');
  }
}

module.exports = { runGemini };
