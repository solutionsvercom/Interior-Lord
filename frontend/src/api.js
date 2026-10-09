export async function getContent() {
  const res = await fetch('/api/content');
  if (!res.ok) throw new Error('Failed to load content');
  return res.json();
}

export async function sendMessage(payload) {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to send message');
  return data;
}
