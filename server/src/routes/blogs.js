import express from 'express';
import slugify from 'slugify';
import { query } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const { rows } = await query(
    `SELECT id, title, slug, content_md, published, created_at, updated_at
     FROM blogs WHERE published = TRUE ORDER BY created_at DESC`
  );
  res.json(rows);
});

router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const { rows } = await query(
    `SELECT id, title, slug, content_md, published, created_at, updated_at FROM blogs WHERE slug=$1`,
    [slug]
  );
  const blog = rows[0];
  if (!blog) return res.status(404).json({ error: 'Not found' });
  res.json(blog);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { title, content_md, published = true } = req.body ?? {};
  const baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  // ensure unique slug
  let i = 1;
  while (true) {
    const { rows: exists } = await query('SELECT 1 FROM blogs WHERE slug=$1', [slug]);
    if (exists.length === 0) break;
    slug = `${baseSlug}-${i++}`;
  }
  const { rows } = await query(
    `INSERT INTO blogs (title, slug, content_md, published)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, slug, content_md, published, created_at, updated_at`,
    [title, slug, content_md ?? '', published]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { title, content_md, published } = req.body ?? {};
  const { rows } = await query(
    `UPDATE blogs SET
       title=COALESCE($2, title),
       content_md=COALESCE($3, content_md),
       published=COALESCE($4, published),
       updated_at=NOW()
     WHERE id=$1
     RETURNING id, title, slug, content_md, published, created_at, updated_at`,
    [id, title ?? null, content_md ?? null, published ?? null]
  );
  res.json(rows[0] ?? null);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await query('DELETE FROM blogs WHERE id=$1', [id]);
  res.json({ ok: true });
});

// Comments (public on)
router.get('/:id/comments', async (req, res) => {
  const id = Number(req.params.id);
  // Only approved by default
  const { rows } = await query(
    `SELECT id, blog_id, author_name, body, image_url, approved, created_at FROM comments
     WHERE blog_id=$1 AND approved=TRUE ORDER BY created_at ASC`,
    [id]
  );
  const ids = rows.map(r => r.id);
  if (ids.length === 0) return res.json(rows);
  const { rows: rx } = await query(
    `SELECT comment_id, type, count FROM comment_reactions WHERE comment_id = ANY($1)`,
    [ids]
  );
  const map = new Map();
  for (const r of rx) {
    if (!map.has(r.comment_id)) map.set(r.comment_id, {});
    map.get(r.comment_id)[r.type] = Number(r.count);
  }
  const enriched = rows.map(c => ({ ...c, reactions: map.get(c.id) || {} }));
  res.json(enriched);
});

router.post('/:id/comments', async (req, res) => {
  const blogId = Number(req.params.id);
  let { author_name, body, image_url } = req.body ?? {};
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return res.status(400).json({ error: 'body is required' });
  }
  const name = (author_name && String(author_name).trim().length > 0) ? String(author_name).trim() : 'guest';
  const { rows } = await query(
    `INSERT INTO comments (blog_id, author_name, body, image_url, approved)
     VALUES ($1, $2, $3, $4, TRUE)
     RETURNING id, blog_id, author_name, body, image_url, approved, created_at`,
    [blogId, name, body, image_url ?? null]
  );
  res.status(201).json({ ...rows[0], reactions: {} });
});

// Admin comments moderation
router.get('/:id/comments/all', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await query(
    `SELECT id, blog_id, author_name, body, image_url, approved, created_at FROM comments
     WHERE blog_id=$1 ORDER BY created_at ASC`,
    [id]
  );
  const ids = rows.map(r => r.id);
  if (ids.length === 0) return res.json(rows);
  const { rows: rx } = await query(
    `SELECT comment_id, type, count FROM comment_reactions WHERE comment_id = ANY($1)`,
    [ids]
  );
  const map = new Map();
  for (const r of rx) {
    if (!map.has(r.comment_id)) map.set(r.comment_id, {});
    map.get(r.comment_id)[r.type] = Number(r.count);
  }
  const enriched = rows.map(c => ({ ...c, reactions: map.get(c.id) || {} }));
  res.json(enriched);
});

router.put('/comments/:commentId', requireAuth, requireAdmin, async (req, res) => {
  const commentId = Number(req.params.commentId);
  const { approved } = req.body ?? {};
  const { rows } = await query(
    `UPDATE comments SET approved=COALESCE($2, approved) WHERE id=$1
     RETURNING id, blog_id, author_name, body, approved, created_at`,
    [commentId, approved ?? null]
  );
  res.json(rows[0] ?? null);
});

router.delete('/comments/:commentId', requireAuth, requireAdmin, async (req, res) => {
  const commentId = Number(req.params.commentId);
  await query('DELETE FROM comments WHERE id=$1', [commentId]);
  res.json({ ok: true });
});

export default router;

// Reactions endpoints
router.get('/comments/:commentId/reactions', async (req, res) => {
  const commentId = Number(req.params.commentId);
  const { rows } = await query(
    `SELECT type, count FROM comment_reactions WHERE comment_id=$1`,
    [commentId]
  );
  const obj = {};
  for (const r of rows) obj[r.type] = Number(r.count);
  res.json(obj);
});

router.post('/comments/:commentId/reactions', async (req, res) => {
  const commentId = Number(req.params.commentId);
  const { type } = req.body ?? {};
  if (!type || typeof type !== 'string') return res.status(400).json({ error: 'type required' });
  await query(
    `INSERT INTO comment_reactions (comment_id, type, count)
     VALUES ($1, $2, 1)
     ON CONFLICT (comment_id, type) DO UPDATE SET count = comment_reactions.count + 1`,
    [commentId, type]
  );
  const { rows } = await query(
    `SELECT type, count FROM comment_reactions WHERE comment_id=$1`,
    [commentId]
  );
  const obj = {};
  for (const r of rows) obj[r.type] = Number(r.count);
  res.json(obj);
});
