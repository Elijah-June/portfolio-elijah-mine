// Base URL for Netlify functions
const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_NETLIFY_FUNCTIONS_URL) || '';

// Get auth tokens from localStorage
const getAuthTokens = () => {
  if (typeof window === 'undefined') return {};
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
  };
};

// Set auth tokens in localStorage
const setAuthTokens = ({ accessToken, refreshToken }) => {
  if (typeof window === 'undefined') return;
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

// Clear auth tokens from localStorage
const clearAuthTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export async function api(path, { method = 'GET', data, headers = {}, body, ...rest } = {}) {
  const isForm = (typeof FormData !== 'undefined') && (data instanceof FormData || body instanceof FormData);
  const { accessToken } = getAuthTokens();
  
  const defaultHeaders = {};
  
  // Set content type for non-form data
  if (!isForm && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  // Add authorization header if token exists
  if (accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const opts = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...rest,
  };
  
  // Handle request body
  if (isForm) {
    opts.body = body || data; // let browser set content-type
  } else if (data) {
    opts.body = JSON.stringify(data);
  } else if (body) {
    opts.body = body;
  }
  
  // Construct the full URL
  const functionName = path.split('/')[2] || ''; // Extract function name from path
  const apiPath = path.replace(/^\/api\//, ''); // Remove /api/ prefix
  const url = `${BASE_URL}/.netlify/functions/${functionName}${apiPath.replace(functionName, '')}`;
  
  let res = await fetch(url, opts);
  const contentType = res.headers.get('content-type') || '';
  let respBody;
  
  // Parse response body
  try {
    respBody = contentType.includes('application/json') ? await res.json() : await res.text();
  } catch (error) {
    console.error('Error parsing response:', error);
    respBody = await res.text();
  }
  
  // Handle 401 Unauthorized with token refresh
  if (res.status === 401 && path !== '/api/auth/refresh') {
    try {
      const refreshResult = await refreshToken();
      if (refreshResult) {
        // Retry the original request with new token
        if (refreshResult.accessToken) {
          opts.headers['Authorization'] = `Bearer ${refreshResult.accessToken}`;
          res = await fetch(url, opts);
          
          // Parse the retry response
          try {
            respBody = res.headers.get('content-type')?.includes('application/json') 
              ? await res.json() 
              : await res.text();
          } catch (error) {
            console.error('Error parsing retry response:', error);
            respBody = await res.text();
          }
        }
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      clearAuthTokens();
      window.dispatchEvent(new Event('unauthorized'));
    }
  }
  
  // Handle errors
  if (!res.ok) {
    const error = new Error(respBody?.error || res.statusText || 'Request failed');
    error.status = res.status;
    error.body = respBody;
    throw error;
  }
  
  // Handle successful authentication responses
  if (respBody?.accessToken || respBody?.refreshToken) {
    setAuthTokens({
      accessToken: respBody.accessToken,
      refreshToken: respBody.refreshToken
    });
  }
  
  return respBody;
  return respBody;
}

// Helper function to refresh access token
async function refreshToken() {
  const { refreshToken } = getAuthTokens();
  if (!refreshToken) return null;
  
  try {
    const response = await fetch(`${BASE_URL}/.netlify/functions/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    
    if (data.accessToken) {
      setAuthTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken
      });
      return { accessToken: data.accessToken };
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearAuthTokens();
    throw error;
  }
}

// Logout function
export function logout() {
  clearAuthTokens();
  // Notify other tabs/windows about logout
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('logout', Date.now().toString());
    window.dispatchEvent(new Event('storage'));
  }
}

// Listen for logout from other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'logout') {
      clearAuthTokens();
      window.dispatchEvent(new Event('unauthorized'));
    }
  });
}
