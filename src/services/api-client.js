if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set (frontend/.env.local)');
}
// Strip any trailing slash(es) so `${BASE_URL}/api${path}` never produces a
// double slash (e.g. NEXT_PUBLIC_API_URL="https://host.com/" -> "https://host.com//api/...").
const BASE_URL = process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem('iic.token');
}

async function request(path, { method = 'GET', body, isFormData = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  let payload = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    // Session expired or invalid token — force back to login
    if (res.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.sessionStorage.removeItem('iic.token');
      window.sessionStorage.removeItem('iic.user');
      window.location.href = '/login?expired=1';
    }
    throw new ApiError(payload?.error || payload?.message || 'Request failed', res.status, payload);
  }
  return payload;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData, isFormData: true }),
};

export { ApiError };
