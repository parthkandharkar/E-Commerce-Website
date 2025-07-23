const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  subcategories: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Categories', categorySchema);
