const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, maxlength: 180 },
  message: { type: String, required: true, trim: true, maxlength: 4000 }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
