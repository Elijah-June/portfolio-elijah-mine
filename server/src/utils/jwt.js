import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiresIn });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

export function cookieOptions() {
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
  if (process.env.COOKIE_DOMAIN) base.domain = process.env.COOKIE_DOMAIN;
  return base;
}

export function setAuthCookies(res, accessToken, refreshToken) {
  const base = cookieOptions();
  res.cookie('access_token', accessToken, { ...base });
  res.cookie('refresh_token', refreshToken, { ...base });
}

export function clearAuthCookies(res) {
  const base = cookieOptions();
  res.clearCookie('access_token', { ...base });
  res.clearCookie('refresh_token', { ...base });
}
