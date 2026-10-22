const API_BASE = '/api';

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
  // CSRF do backend (419 se ausente) em mutações — exceto login/register.
  if (
    method !== 'GET' &&
    path !== '/auth/login' &&
    path !== '/auth/register' &&
    path !== '/auth/csrf'
  ) {
    try {
      const token = await ensureCsrf();
      if (token) headers['X-CSRF-Token'] = token;
    } catch {
      /* backend offline: segue e falha com erro claro */
    }
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    signal: options.signal || AbortSignal.timeout(8000),
    credentials: 'include',
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 419) csrf = null; // token expirado: refaz no próximo
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
};
