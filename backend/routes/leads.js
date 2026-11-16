const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const { login, requireCrm } = require('../lib/crmAuth');
const { mailReady } = require('../lib/mail');
const { tooMany } = require('../lib/limit');

const router = express.Router();
const STATUSES = ['new', 'contacted', 'qualified', 'closed'];

function clientIp(req) {
  return String(req.ip || req.socket?.remoteAddress || 'local');
}

function present(doc) {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email || '',
    phone: doc.phone || '',
    message: doc.message,
    source: doc.source || 'contact',
    intent: doc.intent || 'inquire',
    status: doc.status || 'new',
    note: doc.note || '',
    mailStudio: Boolean(doc.mailStudio),
    mailThanks: Boolean(doc.mailThanks),
    mailError: doc.mailError || '',
    createdAt: doc.createdAt
  };
}

router.post('/login', (req, res) => {
  if (tooMany(`crm-login:${clientIp(req)}`, 8, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Please wait a few minutes, then try the password again.' });
  }
  return login(req, res);
});

router.use(requireCrm);

router.get('/', async (req, res, next) => {
  try {
    const leads = await Message.find().sort({ createdAt: -1 }).limit(300).lean();
    res.json({
      mailReady: mailReady(),
      leads: leads.map(present)
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    const update = {};
    if (req.body.status !== undefined) {
      const status = String(req.body.status);
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Choose a valid status.' });
      }
      update.status = status;
    }
    if (req.body.note !== undefined) {
      update.note = String(req.body.note || '').trim().slice(0, 2000);
    }
    if (!Object.keys(update).length) {
      return res.status(400).json({ error: 'Nothing to update.' });
    }

    const saved = await Message.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!saved) return res.status(404).json({ error: 'Lead not found.' });
    return res.json({ lead: present(saved) });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Lead not found.' });
    }
    const saved = await Message.findByIdAndDelete(req.params.id).lean();
    if (!saved) return res.status(404).json({ error: 'Lead not found.' });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
