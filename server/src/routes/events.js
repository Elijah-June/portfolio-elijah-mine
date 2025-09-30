import express from 'express';
import { query } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const { rows } = await query(
    `SELECT id, title, start_at, end_at, ref_type, ref_id FROM events ORDER BY start_at DESC`
  );
  res.json(rows);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { title, start_at, end_at, ref_type, ref_id } = req.body ?? {};
  const { rows } = await query(
    `INSERT INTO events (title, start_at, end_at, ref_type, ref_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, start_at, end_at, ref_type, ref_id`,
    [title, start_at, end_at ?? null, ref_type ?? null, ref_id ?? null]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { title, start_at, end_at, ref_type, ref_id } = req.body ?? {};
  const { rows } = await query(
    `UPDATE events SET
       title=COALESCE($2, title),
       start_at=COALESCE($3, start_at),
       end_at=COALESCE($4, end_at),
       ref_type=COALESCE($5, ref_type),
       ref_id=COALESCE($6, ref_id)
     WHERE id=$1
     RETURNING id, title, start_at, end_at, ref_type, ref_id`,
    [id, title ?? null, start_at ?? null, end_at ?? null, ref_type ?? null, ref_id ?? null]
  );
  res.json(rows[0] ?? null);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await query('DELETE FROM events WHERE id=$1', [id]);
  res.json({ ok: true });
});

export default router;
