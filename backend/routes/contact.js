const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const message = String(req.body.message || '').trim();

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    const saved = await Message.create({ name, email, message });
    res.status(201).json({
      ok: true,
      id: String(saved._id)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
