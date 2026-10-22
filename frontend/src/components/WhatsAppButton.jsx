import { whatsappHref } from '../whatsapp';

function Icon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20.5 3.5A11 11 0 0 0 2.05 17.7L1 23l5.45-1.43A11 11 0 0 0 12 23a11 11 0 0 0 8.5-19.5zM12 21a9 9 0 0 1-4.58-1.25l-.33-.2-3.23.85.86-3.15-.21-.33A9 9 0 1 1 12 21zm4.95-6.74c-.27-.14-1.6-.79-1.85-.88s-.43-.14-.61.14-.7.88-.86 1.06-.32.21-.59.07a7.4 7.4 0 0 1-2.18-1.35 8.2 8.2 0 0 1-1.51-1.88c-.16-.27 0-.42.12-.55s.27-.32.41-.48a1.8 1.8 0 0 0 .27-.45.5.5 0 0 0 0-.48c-.07-.14-.61-1.47-.84-2s-.45-.46-.61-.47h-.52a1 1 0 0 0-.73.34 3 3 0 0 0-.95 2.26 5.3 5.3 0 0 0 1.11 2.8 12 12 0 0 0 4.65 4.12 16 16 0 0 0 1.55.57 3.7 3.7 0 0 0 1.72.11 2.8 2.8 0 0 0 1.84-1.29 2.3 2.3 0 0 0 .16-1.29c-.06-.11-.23-.17-.5-.3z" />
    </svg>
  );
}

export default function WhatsAppButton({ studio, floating = false }) {
  const href = whatsappHref(studio);
  if (!href) return null;
  return (
    <a
      className={floating ? 'whatsapp-float' : 'whatsapp-cta'}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Interior Lord on WhatsApp"
    >
      <Icon />
      WhatsApp
    </a>
  );
}
