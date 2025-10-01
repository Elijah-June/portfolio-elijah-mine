import jwt from 'jsonwebtoken';

// Access tokens: short-lived, used for Authorization header
export function createAccessToken(payload) {
  const secret = process.env.JWT_ACCESS_SECRET;
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });
}

// Refresh tokens: longer-lived, used to obtain new access tokens
export function createRefreshToken(payload) {
  const secret = process.env.JWT_REFRESH_SECRET;
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });
}

export function verifyAccessTokenFromHeader(authHeader) {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    return decoded;
  } catch (error) {
    console.error('Access token verification failed:', error);
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}
