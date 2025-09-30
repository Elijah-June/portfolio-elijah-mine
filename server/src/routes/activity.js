import express from 'express';
import { query } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10); // 1-12
  if (!year || !month || month < 1 || month > 12) {
    return res.status(400).json({ error: 'year and month (1-12) are required' });
  }
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const { rows } = await query(
    'SELECT date, active FROM activity WHERE date >= $1::date AND date < $2::date ORDER BY date ASC',
    [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
  );
  res.json(rows);
});

router.get('/export', async (req, res) => {
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10); // 1-12
  if (!year || !month || month < 1 || month > 12) {
    return res.status(400).json({ error: 'year and month (1-12) are required' });
  }
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const { rows } = await query(
    'SELECT date, active FROM activity WHERE date >= $1::date AND date < $2::date ORDER BY date ASC',
    [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
  );
  const header = 'date,active\n';
  const csv = header + rows.map(r => `${r.date.toISOString().slice(0,10)},${r.active ? '1' : '0'}`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="activity_${year}-${String(month).padStart(2,'0')}.csv"`);
  res.send(csv);
});

router.post('/bulk', requireAuth, requireAdmin, async (req, res) => {
  const { start, end, active } = req.body ?? {};
  if (!start || !end || typeof active !== 'boolean') {
    return res.status(400).json({ error: 'start, end, active required' });
  }
  await query(
    `INSERT INTO activity (date, active)
     SELECT d::date, $3 FROM generate_series($1::date, $2::date, '1 day') AS g(d)
     ON CONFLICT (date) DO UPDATE SET active=EXCLUDED.active`,
    [start, end, active]
  );
  res.json({ ok: true });
});

router.put('/:date', requireAuth, requireAdmin, async (req, res) => {
  const dateStr = req.params.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
  }
  const { active } = req.body ?? {};
  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: 'active must be boolean' });
  }
  const { rows } = await query(
    `INSERT INTO activity (date, active)
     VALUES ($1::date, $2)
     ON CONFLICT (date) DO UPDATE SET active=EXCLUDED.active
     RETURNING date, active`,
    [dateStr, active]
  );
  res.json(rows[0]);
});

export default router;
