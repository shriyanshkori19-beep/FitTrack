const BASE = import.meta.env.VITE_API_URL || '/api';

export const getToken = () => localStorage.getItem('fittrack_token');
export const setToken = (t) => (t ? localStorage.setItem('fittrack_token', t) : localStorage.removeItem('fittrack_token'));

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && getToken()) window.dispatchEvent(new Event('auth:logout'));
    throw new Error(
      data.message ||
      (res.status >= 500
        ? 'Cannot reach the server. Check that the backend is running and MongoDB is connected.'
        : 'Something went wrong')
    );
  }
  return data;
}

// Today's date in the user's own timezone, as YYYY-MM-DD
export function localDate(d = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export const fmtDate = (s) =>
  new Date(s + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
