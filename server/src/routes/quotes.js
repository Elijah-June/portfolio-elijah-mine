import express from 'express';
import { query } from '../db.js';
import { config } from '../config.js';

const router = express.Router();

function getDayOfYearInTZ(tz) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const year = Number(parts.find(p => p.type === 'year').value);
  const month = Number(parts.find(p => p.type === 'month').value);
  const day = Number(parts.find(p => p.type === 'day').value);
  const date = new Date(Date.UTC(year, month - 1, day));
  const start = new Date(Date.UTC(year, 0, 0));
  const diff = date - start;
  return Math.floor(diff / 86400000); // ms per day
}

router.get('/daily', async (_req, res) => {
  const { rows } = await query('SELECT id, text, author FROM quotes ORDER BY id ASC');
  if (rows.length === 0) return res.json(null);
  const doy = getDayOfYearInTZ(config.tz);
  const idx = (doy - 1) % rows.length;
  res.json(rows[idx]);
});

export default router;
