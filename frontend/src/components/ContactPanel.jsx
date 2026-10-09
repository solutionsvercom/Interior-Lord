import { useState } from 'react';
import { sendMessage } from '../api';

export default function ContactPanel({ active, studio }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setStatus('');
    try {
      await sendMessage({ name, email, message });
      setName('');
      setEmail('');
      setMessage('');
      setStatus('Message sent');
    } catch (err) {
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
        <form className="contact-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="hello@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" placeholder="Tell us about your project..." value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <button type="submit" className="form-submit">
            {sending ? 'Sending...' : 'Send Message'}
          </button>
          {status ? <span className="contact-label" style={{ marginBottom: 0 }}>{status}</span> : null}
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
