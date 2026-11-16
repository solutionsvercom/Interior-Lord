const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const { tooMany } = require('../lib/limit');
const { THANKS, sendLeadMail } = require('../lib/mail');

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clip(value, max) {
  return String(value || '').trim().slice(0, max);
}

function validPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15 && /^[+()\d][\d\s().-]{7,}$/.test(phone);
}

function clientIp(req) {
  return String(req.ip || req.socket?.remoteAddress || 'local');
}

router.post('/', async (req, res, next) => {
  try {
    if (tooMany(`contact:${clientIp(req)}`, 8, 10 * 60 * 1000)) {
      return res.status(429).json({ error: 'Please wait a few minutes before sending another message.' });
    }

    if (String(req.body.company || '').trim()) {
      return res.status(201).json({ ok: true, thanks: THANKS });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'The studio inbox is unavailable right now. Please WhatsApp or email us directly.' });
    }

    const source = req.body.source === 'whatsapp' ? 'whatsapp' : 'contact';
    const intent = req.body.intent === 'register' ? 'register' : 'inquire';
    const name = clip(req.body.name, 120);
    const email = clip(req.body.email, 180);
    const phone = clip(req.body.phone, 40);
    let message = clip(req.body.message, 4000);

    if (name.length < 2) {
      return res.status(400).json({ error: 'Enter your name.' });
    }
    if (source === 'contact') {
      if (!email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
      }
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (source === 'whatsapp' && !phone) {
      return res.status(400).json({ error: 'Name and phone are required.' });
    }
    if (phone && !validPhone(phone)) {
      return res.status(400).json({ error: 'Enter a valid phone number.' });
    }
    if (!message) {
      message = intent === 'register'
        ? 'I would like to register for an interior project.'
        : 'I would like to enquire about an interior project.';
    }

    const saved = await Message.create({
      name,
      email,
      phone,
      message,
      source,
      intent,
      status: 'new'
    });

    let mail = { studio: false, thanks: false, error: 'The email could not be sent.' };
    try {
      mail = await sendLeadMail({ name, email, phone, message, source, intent });
    } catch (err) {
      console.error('Lead email failed:', err && err.message ? err.message : err);
    }
    try {
      saved.mailStudio = mail.studio;
      saved.mailThanks = mail.thanks;
      saved.mailError = clip(mail.error, 300);
      await saved.save();
    } catch (err) {
      console.error('Could not store mail status:', err && err.message ? err.message : err);
    }

    return res.status(201).json({
      ok: true,
      id: String(saved._id),
      thanks: THANKS
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
