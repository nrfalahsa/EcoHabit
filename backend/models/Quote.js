const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  author: {
    type: String,
    default: 'Anonymous'
  },
  category: {
    type: String,
    default: 'environment'
  }
});

module.exports = mongoose.model('Quote', quoteSchema);
