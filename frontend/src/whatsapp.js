export function whatsappHref(studio, text) {
  const digits = String(studio?.phoneTel || studio?.phone || '').replace(/\D/g, '');
  if (!digits) return '';
  const body = text || 'Hello Interior Lord, I would like to enquire about an interior project.';
  return `https://wa.me/${digits}?text=${encodeURIComponent(body)}`;
}

export function whatsappText({ name, phone, intent, message }) {
  const reason = intent === 'register'
    ? 'I would like to register for an interior project.'
    : 'I would like to enquire about an interior project.';
  const who = [name, phone].filter(Boolean).join(', ');
  const detail = String(message || '').trim();
  return `Hello Interior Lord, I am ${who}. ${detail || reason}`;
}
