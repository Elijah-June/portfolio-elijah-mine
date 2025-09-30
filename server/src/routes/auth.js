import express from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { signAccessToken, signRefreshToken, setAuthCookies, clearAuthCookies, verifyRefreshToken } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const { rows } = await query('SELECT id, email, password_hash, role FROM users WHERE email=$1', [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const payload = { id: user.id, email: user.email, role: user.role };
  const access = signAccessToken(payload);
  const refresh = signRefreshToken(payload);
  setAuthCookies(res, access, refresh);
  res.json({ user: payload });
});

router.post('/logout', async (_req, res) => {
  clearAuthCookies(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyRefreshToken(token);
    const access = signAccessToken({ id: payload.id, email: payload.email, role: payload.role });
    const refresh = signRefreshToken({ id: payload.id, email: payload.email, role: payload.role });
    setAuthCookies(res, access, refresh);
    res.json({ ok: true });
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

export default router;
