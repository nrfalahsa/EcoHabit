const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const auth = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Batas 10MB
});

/**
 * @route   POST api/upload/catbox
 * @desc    Upload gambar ke Catbox melalui proxy server
 * @access  Private
 */
router.post('/catbox', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await axios.post('https://catbox.moe/user/api.php', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    if (response.status === 200) {
        res.json({ url: response.data });
    } else {
        throw new Error('Gagal upload ke Catbox');
    }

  } catch (error) {
    console.error('Upload Proxy Error:', error.message);
    res.status(500).json({ message: 'Gagal memproses upload gambar' });
  }
});

module.exports = router;