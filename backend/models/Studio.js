const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  number: { type: String, required: true },
  label: { type: String, required: true }
}, { _id: false });

const studioSchema = new mongoose.Schema({
  contentVersion: { type: String, default: '' },
  brand: { type: String, required: true },
  brandMark: { type: String, default: '' },
  brandAccent: { type: String, default: '' },
  tagline: { type: String, required: true },
  workLabel: { type: String, required: true },
  hoverHint: { type: String, required: true },
  workCountLabel: { type: String, default: 'Projects' },
  canvasHint: { type: String, default: 'Select a project' },
  aboutLabel: { type: String, required: true },
  aboutHeadlineBefore: { type: String, required: true },
  aboutHeadlineEm: { type: String, required: true },
  aboutHeadlineAfter: { type: String, required: true },
  aboutBody: { type: String, required: true },
  stats: { type: [statSchema], default: [] },
  aboutImage: { type: String, required: true },
  aboutQuote: { type: String, required: true },
  aboutAttr: { type: String, required: true },
  contactLabel: { type: String, required: true },
  contactHeadline: { type: String, required: true },
  contactImage: { type: String, required: true },
  contactQuote: { type: String, required: true },
  contactAttr: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  phoneTel: { type: String, default: '' },
  address: { type: String, default: '' },
  mapHref: { type: String, default: '' },
  directLabel: { type: String, required: true },
  phoneLabel: { type: String, default: 'Phone' },
  addressLabel: { type: String, default: 'Studio' },
  socialLabel: { type: String, required: true },
  socialText: { type: String, default: '' },
  socialHref: { type: String, default: '#' },
  introVideo: { type: String, default: '' },
  introPoster: { type: String, default: '' },
  privacyLabel: { type: String, default: 'Privacy' },
  termsLabel: { type: String, default: 'Terms' },
  footerCopy: { type: String, required: true },
  privacyHref: { type: String, default: '#' },
  termsHref: { type: String, default: '#' },
  creditHref: { type: String, required: true },
  creditLabel: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Studio', studioSchema);
