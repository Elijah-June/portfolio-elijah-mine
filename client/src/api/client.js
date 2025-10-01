const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.VITE_API_URL !== 'undefined')
  ? import.meta.env.VITE_API_URL
  : (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'http://localhost:4000'
    : '';

export async function api(path, { method='GET', data, headers={}, body, ...rest } = {}) {
  const isForm = (typeof FormData !== 'undefined') && (data instanceof FormData || body instanceof FormData);
  const opts = {
    method,
    headers: {
      ...(!isForm && data ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    credentials: 'include',
    cache: 'no-store',
    ...rest,
  };
  if (isForm) {
    opts.body = body || data; // let browser set content-type
  } else if (data) {
    opts.body = JSON.stringify(data);
  } else if (body) {
    opts.body = body;
  }

  let res = await fetch(`${BASE_URL}${path}`, opts);
  const contentType = res.headers.get('content-type') || '';
  let respBody;
  if (contentType.includes('application/json')) {
    respBody = await res.json();
  } else {
    respBody = await res.text();
  }
  if (!res.ok) {
    // attempt refresh once on 401
    if (res.status === 401 && path !== '/api/auth/refresh') {
      const r = await fetch(`${BASE_URL}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
      if (r.ok) {
        res = await fetch(`${BASE_URL}${path}`, opts);
        const ct2 = res.headers.get('content-type') || '';
        respBody = ct2.includes('application/json') ? await res.json() : await res.text();
        if (res.ok) return respBody;
      }
    }
    const err = new Error(respBody?.error || res.statusText);
    err.status = res.status;
    err.body = respBody;
    throw err;
  }
  return respBody;
}
