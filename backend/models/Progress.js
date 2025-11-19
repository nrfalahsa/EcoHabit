const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  activities: [{
    name: String,
    points: Number,
    completed: Boolean,
    completedAt: Date
  }],
  dailyPoints: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

progressSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Progress', progressSchema);
