import bcrypt from 'bcrypt';
import { query, successResponse, errorResponse } from './utils/db.js';
import { createToken } from './utils/auth.js';

// In a real app, you would want to use environment variables for these
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};

function setAuthCookies(res, accessToken, refreshToken) {
  // In Netlify Functions, we'll return the tokens in the response body
  // and let the client handle setting them as cookies
  return {
    accessToken,
    refreshToken,
    cookieOptions: COOKIE_OPTIONS
  };
}

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: '',
    };
  }

  const path = event.path.replace('/.netlify/functions/auth', '');
  const pathSegments = path.split('/').filter(Boolean);
  const endpoint = pathSegments[0] || '';

  try {
    // POST /auth/login
    if (event.httpMethod === 'POST' && endpoint === 'login') {
      const { email, password } = JSON.parse(event.body || '{}');
      
      if (!email || !password) {
        return errorResponse('Email and password are required', 400);
      }
      
      const { rows } = await query(
        'SELECT id, email, password_hash, role FROM users WHERE email = $1',
        [email]
      );
      
      const user = rows[0];
      if (!user) {
        return errorResponse('Invalid credentials', 401);
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return errorResponse('Invalid credentials', 401);
      }
      
      const payload = { id: user.id, email: user.email, role: user.role };
      const accessToken = createToken(payload, { expiresIn: '15m' });
      const refreshToken = createToken(payload, { expiresIn: '7d' });
      
      const authData = setAuthCookies(null, accessToken, refreshToken);
      
      return successResponse({
        user: payload,
        ...authData
      });
    }

    // POST /auth/logout
    if (event.httpMethod === 'POST' && endpoint === 'logout') {
      return successResponse({ 
        ok: true,
        // Return empty tokens to clear them on the client
        accessToken: '',
        refreshToken: '',
        cookieOptions: {
          ...COOKIE_OPTIONS,
          maxAge: 0 // Expire immediately
        }
      });
    }

    // GET /auth/me
    if (event.httpMethod === 'GET' && endpoint === 'me') {
      const authHeader = event.headers.authorization || '';
      const token = authHeader.split(' ')[1]; // Bearer <token>
      
      if (!token) {
        return errorResponse('Unauthorized', 401);
      }
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return successResponse({ user: decoded });
      } catch (error) {
        return errorResponse('Invalid token', 401);
      }
    }

    // POST /auth/refresh
    if (event.httpMethod === 'POST' && endpoint === 'refresh') {
      const { refreshToken } = JSON.parse(event.body || '{}');
      
      if (!refreshToken) {
        return errorResponse('Refresh token is required', 400);
      }
      
      try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const payload = { 
          id: decoded.id, 
          email: decoded.email, 
          role: decoded.role 
        };
        
        const newAccessToken = createToken(payload, { expiresIn: '15m' });
        const newRefreshToken = createToken(payload, { expiresIn: '7d' });
        
        const authData = setAuthCookies(null, newAccessToken, newRefreshToken);
        
        return successResponse({
          ...authData
        });
      } catch (error) {
        return errorResponse('Invalid refresh token', 401);
      }
    }

    // Handle unsupported methods or paths
    return errorResponse('Not found', 404);
    
  } catch (error) {
    console.error('Error in auth function:', error);
    return errorResponse('Internal server error', 500);
  }
};
