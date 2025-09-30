import { verifyAccessToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}
