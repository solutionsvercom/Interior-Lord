async function request(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = res.status;
    throw error;
  }
  return data;
}

export async function getContent() {
  return request('/api/content');
}

export async function sendMessage(payload) {
  return request('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

function leadHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

export async function loginLeads(password) {
  return request('/api/leads/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
}

export async function getLeads(token) {
  return request('/api/leads', { headers: leadHeaders(token) });
}

export async function updateLead(token, id, payload) {
  return request(`/api/leads/${id}`, {
    method: 'PATCH',
    headers: leadHeaders(token),
    body: JSON.stringify(payload)
  });
}

export async function deleteLead(token, id) {
  return request(`/api/leads/${id}`, {
    method: 'DELETE',
    headers: leadHeaders(token)
  });
}
