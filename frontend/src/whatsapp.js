export function whatsappHref(studio) {
  const digits = String(studio?.phoneTel || studio?.phone || '').replace(/\D/g, '');
  if (!digits) return '';
  const text = encodeURIComponent('Hello Interior Lord, I would like to enquire about an interior project.');
  return `https://wa.me/${digits}?text=${text}`;
}
