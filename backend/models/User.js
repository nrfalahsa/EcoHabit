const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  totalPoints: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    default: '🌱 Green Starter'
  },
  badges: [{
    type: String
  }]
}, {
  timestamps: true
});

// Hash password sebelum menyimpan
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method untuk membandingkan password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update level berdasarkan total poin
userSchema.methods.updateLevel = function() {
  if (this.totalPoints <= 50) {
    this.level = '🌱 Green Starter';
  } else if (this.totalPoints <= 150) {
    this.level = '🌿 Eco Explorer';
  } else if (this.totalPoints <= 300) {
    this.level = '🌎 Planet Hero';
  } else {
    this.level = '🔥 Climate Guardian';
  }
};

module.exports = mongoose.model('User', userSchema);
