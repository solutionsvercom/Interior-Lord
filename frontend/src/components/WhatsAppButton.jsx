import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { sendMessage } from '../api';
import { whatsappHref, whatsappText } from '../whatsapp';
import IntentField from './IntentField';

function Icon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20.5 3.5A11 11 0 0 0 2.05 17.7L1 23l5.45-1.43A11 11 0 0 0 12 23a11 11 0 0 0 8.5-19.5zM12 21a9 9 0 0 1-4.58-1.25l-.33-.2-3.23.85.86-3.15-.21-.33A9 9 0 1 1 12 21zm4.95-6.74c-.27-.14-1.6-.79-1.85-.88s-.43-.14-.61.14-.7.88-.86 1.06-.32.21-.59.07a7.4 7.4 0 0 1-2.18-1.35 8.2 8.2 0 0 1-1.51-1.88c-.16-.27 0-.42.12-.55s.27-.32.41-.48a1.8 1.8 0 0 0 .27-.45.5.5 0 0 0 0-.48c-.07-.14-.61-1.47-.84-2s-.45-.46-.61-.47h-.52a1 1 0 0 0-.73.34 3 3 0 0 0-.95 2.26 5.3 5.3 0 0 0 1.11 2.8 12 12 0 0 0 4.65 4.12 16 16 0 0 0 1.55.57 3.7 3.7 0 0 0 1.72.11 2.8 2.8 0 0 0 1.84-1.29 2.3 2.3 0 0 0 .16-1.29c-.06-.11-.23-.17-.5-.3z" />
    </svg>
  );
}

export default function WhatsAppButton({ studio, floating = false }) {
  const titleId = useId();
  const href = whatsappHref(studio);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [intent, setIntent] = useState('inquire');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('');
  const [statusOk, setStatusOk] = useState(false);
  const [sending, setSending] = useState(false);
  const [doneHref, setDoneHref] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!href) return null;

  function close() {
    if (sending) return;
    setOpen(false);
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (sending) return;
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    if (cleanName.length < 2 || !cleanPhone) {
      setStatusOk(false);
      setStatus('Name and phone are required.');
      return;
    }

    const chat = whatsappHref(studio, whatsappText({
      name: cleanName,
      phone: cleanPhone,
      intent,
      message: note
    }));
    const popup = window.open('about:blank', '_blank');
    setSending(true);
    setStatus('');
    try {
      const data = await sendMessage({
        name: cleanName,
        phone: cleanPhone,
        message: note,
        intent,
        source: 'whatsapp',
        company
      });
      if (popup) {
        popup.opener = null;
        popup.location.href = chat;
      }
      setName('');
      setPhone('');
      setNote('');
      setDoneHref(chat);
      setStatusOk(true);
      setStatus(data.thanks || 'Thank you. Our team will contact you soon.');
    } catch (err) {
      if (popup) popup.close();
      setStatusOk(false);
      setStatus(err.message || 'Could not save your details');
    } finally {
      setSending(false);
    }
  }

  const dialog = open ? createPortal(
    <div className="lead-dialog" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <form className="lead-card" role="dialog" aria-modal="true" aria-labelledby={titleId} onSubmit={onSubmit}>
        <button type="button" className="lead-close" onClick={close}>Close</button>
        <span className="contact-label">WhatsApp</span>
        <h2 id={titleId}>Tell us how to reach you.</h2>
        <IntentField value={intent} onChange={setIntent} />
        <div className="form-group">
          <label htmlFor={`${titleId}-name`}>Name</label>
          <input id={`${titleId}-name`} type="text" autoComplete="name" placeholder="Your full name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor={`${titleId}-phone`}>Phone</label>
          <input id={`${titleId}-phone`} type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor={`${titleId}-note`}>Message</label>
          <textarea id={`${titleId}-note`} placeholder="Tell us about your project..." value={note} onChange={(event) => setNote(event.target.value)} />
        </div>
        <div className="hp" aria-hidden="true">
          <label htmlFor={`${titleId}-company`}>Company</label>
          <input id={`${titleId}-company`} tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} />
        </div>
        <button type="submit" className="form-submit" disabled={sending}>
          {sending ? 'Saving...' : 'Save and open WhatsApp'}
        </button>
        {status ? <p className={statusOk ? 'form-status' : 'form-status form-status-error'}>{status}</p> : null}
        {doneHref ? <a className="lead-continue" href={doneHref} target="_blank" rel="noreferrer">Open WhatsApp</a> : null}
      </form>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        type="button"
        className={floating ? 'whatsapp-float' : 'whatsapp-cta'}
        onClick={() => { setDoneHref(''); setStatus(''); setOpen(true); }}
        aria-label="Chat with Interior Lord on WhatsApp"
      >
        <Icon />
        WhatsApp
      </button>
      {dialog}
    </>
  );
}
