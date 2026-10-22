export const API_BASE =
  (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || '/api';

let csrf = null;

async function ensureCsrf() {
  if (csrf) return csrf;
  const res = await fetch(`${API_BASE}/auth/csrf`, {
    credentials: 'include',
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json().catch(() => ({}));
  csrf = data.csrf || null;
  return csrf;
}

async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (
    method !== 'GET' &&
    path !== '/auth/login' &&
    path !== '/auth/register' &&
    path !== '/auth/csrf'
  ) {
    try {
      const token = await ensureCsrf();
      if (token) headers['X-CSRF-Token'] = token;
    } catch {}
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    signal: options.signal || AbortSignal.timeout(8000),
    credentials: 'include',
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 419) csrf = null;
  if (!res.ok) throw new Error(data.message || `Erro ${res.status}`);
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) =>
    request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
  resetCsrf: () => {
    csrf = null;
  },
  lines: {
    list: (q = '') =>
      request(`/linhas${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    get: (id) => request(`/linhas/${id}`),
    create: (d) =>
      request('/linhas', { method: 'POST', body: JSON.stringify(d) }),
    update: (id, d) =>
      request(`/linhas/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    remove: (id) => request(`/linhas/${id}`, { method: 'DELETE' }),
    pontos: (id) => request(`/linhas/${id}/pontos`),
    addPonto: (id, d) =>
      request(`/linhas/${id}/pontos`, {
        method: 'POST',
        body: JSON.stringify(d),
      }),
    removePonto: (pid) => request(`/pontos/${pid}`, { method: 'DELETE' }),
  },
  employees: {
    list: () => request('/funcionarios'),
    create: (d) =>
      request('/funcionarios', { method: 'POST', body: JSON.stringify(d) }),
    update: (id, d) =>
      request(`/funcionarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(d),
      }),
    remove: (id) => request(`/funcionarios/${id}`, { method: 'DELETE' }),
  },
  contact: (d) =>
    request('/contato', { method: 'POST', body: JSON.stringify(d) }),
  smtpTest: () => request('/team/smtp-test', { method: 'POST', body: '{}' }),
  messages: {
    list: () => request('/team/messages'),
    remove: (id) => request(`/team/messages/${id}`, { method: 'DELETE' }),
  },
  team: {
    invite: () => request('/team/invite-code'),
    regenerateInvite: () =>
      request('/team/invite-code', { method: 'POST', body: '{}' }),
    users: () => request('/team/users'),
    pending: () => request('/team/pending'),
    createUser: (d) =>
      request('/team/users', { method: 'POST', body: JSON.stringify(d) }),
    approve: (id, linhaIds = []) =>
      request(`/team/users/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ linha_ids: linhaIds }),
      }),
    assign: (id, linhaIds) =>
      request(`/team/users/${id}/lines`, {
        method: 'PUT',
        body: JSON.stringify({ linha_ids: linhaIds }),
      }),
    remove: (id) => request(`/team/users/${id}`, { method: 'DELETE' }),
    audit: () => request('/team/audit'),
  },
};
