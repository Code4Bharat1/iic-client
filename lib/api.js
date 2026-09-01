const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set (frontend/.env.local)');
}

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function getUserId() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('iic.userId');
}

async function request(path, { method = 'GET', body, isFormData = false } = {}) {
  const headers = {};
  const userId = getUserId();
  if (userId) headers['x-user-id'] = userId;
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
    // Session no longer valid (e.g. the demo user was removed/reseeded) — force back to
    // login rather than leaving every page silently empty.
    if (res.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.localStorage.removeItem('iic.userId');
      window.localStorage.removeItem('iic.user');
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
  upload: (path, formData) => request(path, { method: 'POST', body: formData, isFormData: true }),
};

export { ApiError };
