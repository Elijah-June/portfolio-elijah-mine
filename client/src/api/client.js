const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function api(path, { method='GET', data, headers={}, body, ...rest } = {}) {
  const isForm = (typeof FormData !== 'undefined') && (data instanceof FormData || body instanceof FormData);
  const opts = {
    method,
    headers: {
      ...(!isForm && data ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    credentials: 'include',
    ...rest,
  };
  if (isForm) {
    opts.body = body || data; // let browser set content-type
  } else if (data) {
    opts.body = JSON.stringify(data);
  } else if (body) {
    opts.body = body;
  }

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const contentType = res.headers.get('content-type') || '';
  let respBody;
  if (contentType.includes('application/json')) {
    respBody = await res.json();
  } else {
    respBody = await res.text();
  }
  if (!res.ok) {
    const err = new Error(respBody?.error || res.statusText);
    err.status = res.status;
    err.body = respBody;
    throw err;
  }
  return respBody;
}
