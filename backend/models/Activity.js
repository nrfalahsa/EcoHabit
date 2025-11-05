const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  points: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
   type: String,
   default: 'Lainnya',
  trim: true
  },
  description: {
    type: String,
    trim: true,
    default: 'Deskripsi untuk aktivitas ini belum tersedia.'
  },
  howTo: {
    type: String,
    trim: true,
    default: 'Tips untuk aktivitas ini belum tersedia.'
  },
  // Faktor Dampak (Estimasi)
  impact_co2_kg: {
    type: Number,
    default: 0
  },
  impact_water_liter: {
    type: Number,
    default: 0
  },
  impact_plastic_gram: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);