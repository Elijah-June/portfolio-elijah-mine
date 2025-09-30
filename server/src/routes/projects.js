import express from 'express';
import { query } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT id, title, description, tags, repo_url, demo_url, image_url, created_at, updated_at FROM projects ORDER BY created_at DESC');
  res.json(rows);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { title, description, tags, repo_url, demo_url, image_url } = req.body ?? {};
  const { rows } = await query(
    `INSERT INTO projects (title, description, tags, repo_url, demo_url, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, title, description, tags, repo_url, demo_url, image_url, created_at, updated_at`,
    [title, description ?? null, tags ?? [], repo_url ?? null, demo_url ?? null, image_url ?? null]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, tags, repo_url, demo_url, image_url } = req.body ?? {};
  const { rows } = await query(
    `UPDATE projects SET
       title=COALESCE($2, title),
       description=COALESCE($3, description),
       tags=COALESCE($4, tags),
       repo_url=COALESCE($5, repo_url),
       demo_url=COALESCE($6, demo_url),
       image_url=COALESCE($7, image_url),
       updated_at=NOW()
     WHERE id=$1
     RETURNING id, title, description, tags, repo_url, demo_url, image_url, created_at, updated_at`,
    [id, title ?? null, description ?? null, tags ?? null, repo_url ?? null, demo_url ?? null, image_url ?? null]
  );
  res.json(rows[0] ?? null);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await query('DELETE FROM projects WHERE id=$1', [id]);
  res.json({ ok: true });
});

export default router;
