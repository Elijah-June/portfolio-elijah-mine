import express from 'express';
import { query } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT id, display_name, title, bio, avatar_url, social_links, education, expertise, profile_summary FROM profile LIMIT 1');
  res.json(rows[0] ?? null);
});

router.put('/', requireAuth, requireAdmin, async (req, res) => {
  const { display_name, title, bio, avatar_url, social_links, education, expertise, profile_summary } = req.body ?? {};
  const { rows } = await query(
    `INSERT INTO profile (id, display_name, title, bio, avatar_url, social_links, education, expertise, profile_summary)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE SET display_name=$1, title=$2, bio=$3, avatar_url=$4, social_links=$5, education=$6, expertise=$7, profile_summary=$8
     RETURNING id, display_name, title, bio, avatar_url, social_links, education, expertise, profile_summary`,
    [display_name ?? null, title ?? null, bio ?? null, avatar_url ?? null, social_links ?? {}, education ?? null, expertise ?? null, profile_summary ?? null]
  );
  res.json(rows[0]);
});

export default router;
