const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  number: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  year: { type: String, required: true },
  image: { type: String, required: true },
  video: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
