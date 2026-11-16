const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, trim: true, maxlength: 180, default: '' },
  phone: { type: String, trim: true, maxlength: 40, default: '' },
  message: { type: String, required: true, trim: true, maxlength: 4000 },
  source: { type: String, enum: ['contact', 'whatsapp'], default: 'contact' },
  intent: { type: String, enum: ['inquire', 'register'], default: 'inquire' },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'closed'], default: 'new' },
  note: { type: String, trim: true, maxlength: 2000, default: '' },
  mailStudio: { type: Boolean, default: false },
  mailThanks: { type: Boolean, default: false },
  mailError: { type: String, trim: true, maxlength: 300, default: '' }
}, { timestamps: true });

messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
