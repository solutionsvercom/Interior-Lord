const nodemailer = require('nodemailer');

const STUDIO_EMAIL = 'interiorlord.official@gmail.com';
const THANKS = 'Thank you. Our team will contact you soon.';

function mailUser() {
  return process.env.MAIL_USER || STUDIO_EMAIL;
}

function mailTo() {
  return process.env.MAIL_TO || STUDIO_EMAIL;
}

function mailPass() {
  return String(process.env.MAIL_PASS || '').replace(/\s/g, '');
}

function mailReady() {
  return Boolean(mailPass());
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function safeMailError(err) {
  const message = String(err && err.message ? err.message : err || '');
  if (/auth|password|invalid login|535|534/i.test(message)) {
    return 'Gmail rejected the login. Check the app password.';
  }
  if (/EENVELOPE|recipient|address/i.test(message)) {
    return 'Gmail could not accept one of the addresses.';
  }
  return 'The email could not be sent.';
}

function transport() {
  const pass = mailPass();
  if (!pass) return null;
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: mailUser(), pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });
}

function intentLabel(intent) {
  return intent === 'register' ? 'Registration' : 'Inquiry';
}

function sourceLabel(source) {
  return source === 'whatsapp' ? 'WhatsApp' : 'Contact form';
}

function studioText(lead) {
  return [
    `New ${intentLabel(lead.intent).toLowerCase()} from the Interior Lord website.`,
    '',
    `Name: ${lead.name}`,
    `Email: ${lead.email || '—'}`,
    `Phone: ${lead.phone || '—'}`,
    `Wants to: ${intentLabel(lead.intent)}`,
    `Came from: ${sourceLabel(lead.source)}`,
    '',
    'Message:',
    lead.message,
    '',
    'Open /crm on the website to manage this lead.'
  ].join('\n');
}

function studioHtml(lead) {
  const rows = [
    ['Name', lead.name],
    ['Email', lead.email || '—'],
    ['Phone', lead.phone || '—'],
    ['Wants to', intentLabel(lead.intent)],
    ['Came from', sourceLabel(lead.source)]
  ].map(([label, value]) => (
    `<tr><td style="padding:6px 12px 6px 0;color:#8A8580;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">${label}</td><td style="padding:6px 0;color:#1A1A1A;">${escapeHtml(value)}</td></tr>`
  )).join('');

  return `
    <div style="font-family:Georgia,serif;color:#1A1A1A;line-height:1.5;">
      <p style="margin:0 0 12px;">New ${escapeHtml(intentLabel(lead.intent).toLowerCase())} from the Interior Lord website.</p>
      <table style="border-collapse:collapse;">${rows}</table>
      <p style="margin:16px 0 6px;color:#8A8580;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Message</p>
      <p style="margin:0;white-space:pre-wrap;">${escapeHtml(lead.message)}</p>
      <p style="margin:18px 0 0;color:#8A8580;font-size:13px;">Open /crm on the website to manage this lead.</p>
    </div>
  `;
}

function thanksText(name) {
  return [
    `Hello ${name},`,
    '',
    THANKS,
    '',
    '— Interior Lord',
    'Gaur City Centre, Greater Noida West',
    STUDIO_EMAIL,
    '+91 85888 08040'
  ].join('\n');
}

function thanksHtml(name) {
  return `
    <div style="font-family:Georgia,serif;color:#1A1A1A;line-height:1.6;">
      <p style="margin:0 0 12px;">Hello ${escapeHtml(name)},</p>
      <p style="margin:0 0 12px;">${THANKS}</p>
      <p style="margin:18px 0 0;color:#8A8580;">— Interior Lord<br>Gaur City Centre, Greater Noida West<br>${STUDIO_EMAIL}<br>+91 85888 08040</p>
    </div>
  `;
}

async function sendLeadMail(lead) {
  const tx = transport();
  if (!tx) {
    console.warn('MAIL_PASS is not set. Lead saved without sending email.');
    return { studio: false, thanks: false, error: '' };
  }

  const from = `Interior Lord <${mailUser()}>`;
  const jobs = [
    tx.sendMail({
      from,
      to: mailTo(),
      replyTo: lead.email || undefined,
      subject: `${intentLabel(lead.intent)} from ${lead.name}`,
      text: studioText(lead),
      html: studioHtml(lead)
    })
  ];

  if (lead.email) {
    jobs.push(tx.sendMail({
      from,
      to: lead.email,
      replyTo: mailTo(),
      subject: 'Thank you for contacting Interior Lord',
      text: thanksText(lead.name),
      html: thanksHtml(lead.name)
    }));
  }

  const results = await Promise.allSettled(jobs);
  const studioOk = results[0].status === 'fulfilled';
  const thanksOk = Boolean(lead.email) && results[1] && results[1].status === 'fulfilled';
  const errors = results
    .filter((result) => result.status === 'rejected')
    .map((result) => safeMailError(result.reason));

  if (errors.length) console.error('Lead email failed:', errors.join(' '));

  return {
    studio: studioOk,
    thanks: thanksOk,
    error: errors[0] || ''
  };
}

module.exports = { THANKS, mailReady, sendLeadMail };
