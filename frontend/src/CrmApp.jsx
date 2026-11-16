import { useEffect, useMemo, useState } from 'react';
import { deleteLead, getLeads, loginLeads, updateLead } from './api';

const TOKEN_KEY = 'il-crm-token';

const STATUSES = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'closed', label: 'Closed' }
];

function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function digits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function Login({ onToken }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await loginLeads(password);
      sessionStorage.setItem(TOKEN_KEY, data.token);
      onToken(data.token);
    } catch (err) {
      setError(err.message || 'Could not open leads');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="crm-login">
      <form onSubmit={onSubmit}>
        <span className="contact-label">Interior Lord</span>
        <h1>Leads</h1>
        <p className="crm-intro">Contact form and WhatsApp enquiries for the studio.</p>
        <div className="form-group">
          <label htmlFor="crm-password">Password</label>
          <input
            id="crm-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-submit" disabled={busy}>
          {busy ? 'Opening...' : 'Open leads'}
        </button>
        {error ? <p className="form-status form-status-error">{error}</p> : null}
      </form>
    </main>
  );
}

function LeadCard({ lead, token, onChange, onRemove }) {
  const [note, setNote] = useState(lead.note || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setNote(lead.note || '');
  }, [lead.note]);

  async function save(payload) {
    setBusy(true);
    setError('');
    try {
      const data = await updateLead(token, lead.id, payload);
      onChange(data.lead);
    } catch (err) {
      setError(err.message || 'Could not update this lead');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Remove ${lead.name} from leads?`)) return;
    setBusy(true);
    setError('');
    try {
      await deleteLead(token, lead.id);
      onRemove(lead.id);
    } catch (err) {
      setError(err.message || 'Could not remove this lead');
      setBusy(false);
    }
  }

  const phone = digits(lead.phone);
  const mailLine = lead.mailStudio
    ? (lead.mailThanks ? 'Emailed the studio and the visitor' : 'Emailed the studio')
    : (lead.mailError || 'Waiting to email');

  return (
    <article className="crm-card">
      <header>
        <strong>{lead.name}</strong>
        <time dateTime={lead.createdAt}>{formatWhen(lead.createdAt)}</time>
      </header>
      <p className="crm-badge">
        {lead.source === 'whatsapp' ? 'WhatsApp' : 'Contact form'}
        {' · '}
        {lead.intent === 'register' ? 'Register' : 'Inquire'}
      </p>
      {lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : null}
      {lead.phone ? <a href={phone ? `https://wa.me/${phone}` : undefined}>{lead.phone}</a> : null}
      <p className="crm-message">{lead.message}</p>
      <label>
        Status
        <select value={lead.status || 'new'} disabled={busy} onChange={(event) => save({ status: event.target.value })}>
          {STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      <label>
        Note
        <textarea value={note} maxLength={2000} onChange={(event) => setNote(event.target.value)} placeholder="Follow-up for the studio" />
      </label>
      <div className="crm-actions">
        <button type="button" className="form-submit" disabled={busy || note === (lead.note || '')} onClick={() => save({ note })}>
          Save note
        </button>
        <button type="button" className="crm-text" disabled={busy} onClick={remove}>Remove</button>
      </div>
      <p className={lead.mailError && !lead.mailStudio ? 'crm-mail crm-mail-warn' : 'crm-mail'}>{mailLine}</p>
      {error ? <p className="form-status form-status-error">{error}</p> : null}
    </article>
  );
}

export default function CrmApp() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const [leads, setLeads] = useState([]);
  const [mailReady, setMailReady] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('all');
  const [status, setStatus] = useState('all');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!token) return undefined;
    let ignore = false;
    setLoading(true);
    setError('');
    getLeads(token)
      .then((data) => {
        if (ignore) return;
        setLeads(data.leads || []);
        setMailReady(Boolean(data.mailReady));
      })
      .catch((err) => {
        if (ignore) return;
        if (err.status === 401) {
          sessionStorage.removeItem(TOKEN_KEY);
          setToken('');
          return;
        }
        setError(err.message || 'Could not load leads');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, [token, reload]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (source !== 'all' && lead.source !== source) return false;
      if (status !== 'all' && lead.status !== status) return false;
      if (!needle) return true;
      return `${lead.name} ${lead.email} ${lead.phone} ${lead.message} ${lead.note}`.toLowerCase().includes(needle);
    });
  }, [leads, query, source, status]);

  if (!token) return <Login onToken={setToken} />;

  const fresh = leads.filter((lead) => (lead.status || 'new') === 'new').length;
  const fromForm = leads.filter((lead) => lead.source !== 'whatsapp').length;
  const fromWhatsapp = leads.filter((lead) => lead.source === 'whatsapp').length;

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
    setLeads([]);
  }

  return (
    <main className="crm">
      <header className="crm-header">
        <div>
          <span className="contact-label">Interior Lord</span>
          <h1>Leads</h1>
        </div>
        <div className="crm-header-actions">
          <a href="/">Back to site</a>
          <button type="button" className="crm-text" onClick={() => setReload((value) => value + 1)}>Refresh</button>
          <button type="button" className="crm-text" onClick={logout}>Log out</button>
        </div>
      </header>

      <section className="crm-stats">
        <div><strong>{leads.length}</strong><span>Total</span></div>
        <div><strong>{fresh}</strong><span>New</span></div>
        <div><strong>{fromForm}</strong><span>Contact form</span></div>
        <div><strong>{fromWhatsapp}</strong><span>WhatsApp</span></div>
      </section>

      {mailReady ? null : (
        <p className="crm-banner">
          Add MAIL_PASS, a Gmail app password for interiorlord.official@gmail.com, so each inquiry is emailed to the studio and the visitor receives a thank-you.
        </p>
      )}
      {error ? <p className="form-status form-status-error">{error}</p> : null}

      <div className="crm-toolbar">
        <input
          type="search"
          placeholder="Search name, phone, or email"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search leads"
        />
        {[
          ['all', 'All sources'],
          ['contact', 'Contact form'],
          ['whatsapp', 'WhatsApp']
        ].map(([id, label]) => (
          <button key={id} type="button" className={source === id ? 'crm-chip crm-chip-active' : 'crm-chip'} onClick={() => setSource(id)}>{label}</button>
        ))}
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          {STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </div>

      {loading ? <p className="crm-intro">Loading leads...</p> : null}
      {!loading && visible.length === 0 ? (
        <p className="crm-intro">
          {leads.length === 0
            ? 'No one has inquired yet. Contact form and WhatsApp leads will show up here.'
            : 'No leads match this search.'}
        </p>
      ) : null}
      <div className="crm-list">
        {visible.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            token={token}
            onChange={(next) => setLeads((current) => current.map((item) => (item.id === next.id ? next : item)))}
            onRemove={(id) => setLeads((current) => current.filter((item) => item.id !== id))}
          />
        ))}
      </div>
    </main>
  );
}
