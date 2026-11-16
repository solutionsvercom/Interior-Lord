import { useState } from 'react';
import { sendMessage } from '../api';
import WhatsAppButton from './WhatsAppButton';
import IntentField from './IntentField';

export default function ContactPanel({ active, studio }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [intent, setIntent] = useState('inquire');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('');
  const [statusOk, setStatusOk] = useState(false);
  const [sending, setSending] = useState(false);

  function clearStatus(setter) {
    return (event) => {
      setter(event.target.value);
      setStatus('');
    };
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setStatus('');
    try {
      const data = await sendMessage({ name, email, phone, message, intent, company });
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setIntent('inquire');
      setStatusOk(true);
      setStatus(data.thanks || 'Thank you. Our team will contact you soon.');
    } catch (err) {
      setStatusOk(false);
      setStatus(err.message || 'Could not send message');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={active ? 'panel panel-active' : 'panel'} id="panel-contact">
      <div className="contact-content">
        <span className="contact-label">{studio.contactLabel}</span>
        <h2 className="contact-headline">{studio.contactHeadline}</h2>
        <WhatsAppButton studio={studio} />
        <form className="contact-form" onSubmit={onSubmit}>
          <IntentField value={intent} onChange={setIntent} />
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" autoComplete="name" placeholder="Your full name" value={name} onChange={clearStatus(setName)} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" placeholder="hello@example.com" value={email} onChange={clearStatus(setEmail)} required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={phone} onChange={clearStatus(setPhone)} />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" placeholder="Tell us about your project..." value={message} onChange={clearStatus(setMessage)} required />
          </div>
          <div className="hp" aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input id="company" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} />
          </div>
          <button type="submit" className="form-submit" disabled={sending}>
            {sending ? 'Sending...' : intent === 'register' ? 'Register' : 'Send Message'}
          </button>
          {status ? <p className={statusOk ? 'form-status' : 'form-status form-status-error'}>{status}</p> : null}
        </form>
        <div className="contact-details">
          <span>{studio.directLabel}</span>
          <a href={`mailto:${studio.email}`}>{studio.email}</a>
          {studio.phone ? <span>{studio.phoneLabel || 'Phone'}</span> : null}
          {studio.phone ? <a href={`tel:${studio.phoneTel || studio.phone}`}>{studio.phone}</a> : null}
          {studio.address ? <span>{studio.addressLabel || 'Studio'}</span> : null}
          {studio.address ? <a href={studio.mapHref || '#'} target="_blank" rel="noreferrer">{studio.address}</a> : null}
          <span>{studio.socialLabel}</span>
          <a href={studio.socialHref} target="_blank" rel="noreferrer">{studio.socialText || 'Instagram'}</a>
        </div>
      </div>
    </div>
  );
}
