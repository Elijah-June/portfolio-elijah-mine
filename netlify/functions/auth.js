import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, successResponse, errorResponse } from './utils/db.js';
import { 
  createAccessToken, 
  createRefreshToken, 
  verifyAccessTokenFromHeader,
  verifyRefreshToken
} from './utils/auth.js';

// In Netlify we return tokens in the response; client can store them
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
      
      let rows;
      try {
        ({ rows } = await query(
          'SELECT id, email, password_hash, role FROM users WHERE email = $1',
          [email]
        ));
      } catch (dbErr) {
        console.error('Auth login DB error:', dbErr);
        return errorResponse('Internal server error', 500);
      }
      
      const user = rows[0];
      if (!user) {
        return errorResponse('Invalid credentials', 401);
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return errorResponse('Invalid credentials', 401);
      }
      
      const payload = { id: user.id, email: user.email, role: user.role };
      const accessToken = createAccessToken(payload);
      const refreshToken = createRefreshToken(payload);
      
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
      const decoded = verifyAccessTokenFromHeader(event.headers.authorization || '');
      if (!decoded) return errorResponse('Unauthorized', 401);
      return successResponse({ user: decoded });
    }

    // POST /auth/refresh
    if (event.httpMethod === 'POST' && endpoint === 'refresh') {
      const { refreshToken } = JSON.parse(event.body || '{}');
      
      if (!refreshToken) {
        return errorResponse('Refresh token is required', 400);
      }
      
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) return errorResponse('Invalid refresh token', 401);
      const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
      const newAccessToken = createAccessToken(payload);
      const newRefreshToken = createRefreshToken(payload);
      const authData = setAuthCookies(null, newAccessToken, newRefreshToken);
      return successResponse({ ...authData });
    }

    // Handle unsupported methods or paths
    return errorResponse('Not found', 404);
    
  } catch (error) {
    console.error('Error in auth function:', error);
    return errorResponse('Internal server error', 500);
  }
};
