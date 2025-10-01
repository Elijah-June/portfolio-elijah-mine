import jwt from 'jsonwebtoken';

// Access tokens: short-lived, used for Authorization header
export function createAccessToken(payload) {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev-access-secret';
  const expiresIn = process.env.JWT_ACCESS_EXPIRES || '15m';
  return jwt.sign(payload, secret, { expiresIn });
}

// Refresh tokens: longer-lived, used to obtain new access tokens
export function createRefreshToken(payload) {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-secret';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyAccessTokenFromHeader(authHeader) {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev-access-secret';
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    console.error('Access token verification failed:', error);
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-secret';
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}
