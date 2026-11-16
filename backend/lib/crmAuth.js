const crypto = require('crypto');

function password() {
  return process.env.CRM_PASSWORD || '';
}

function sign(secret) {
  return crypto.createHmac('sha256', secret).update('interior-lord-crm-v1').digest('hex');
}

function safeEqual(leftValue, rightValue) {
  const left = Buffer.from(String(leftValue));
  const right = Buffer.from(String(rightValue));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function tokenFrom(req) {
  const header = req.get('authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

function requireCrm(req, res, next) {
  const secret = password();
  if (!secret) {
    return res.status(503).json({
      error: 'Lead access is not set up yet. Add CRM_PASSWORD in the server settings.'
    });
  }
  const token = tokenFrom(req);
  if (!token || !safeEqual(token, sign(secret))) {
    return res.status(401).json({ error: 'Sign in again to view leads.' });
  }
  return next();
}

function login(req, res) {
  const secret = password();
  if (!secret) {
    return res.status(503).json({
      error: 'Lead access is not set up yet. Add CRM_PASSWORD in the server settings.'
    });
  }
  const given = String((req.body && req.body.password) || '');
  if (!safeEqual(given, secret)) {
    return res.status(401).json({ error: 'That password is not correct.' });
  }
  return res.json({ token: sign(secret) });
}

module.exports = { requireCrm, login };
