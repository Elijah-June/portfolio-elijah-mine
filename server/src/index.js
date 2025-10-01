import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import url from 'url';
import { config } from './config.js';
import { query } from './db.js';
import crypto from 'crypto';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import projectsRoutes from './routes/projects.js';
import blogsRoutes from './routes/blogs.js';
import eventsRoutes from './routes/events.js';
import quotesRoutes from './routes/quotes.js';
import activityRoutes from './routes/activity.js';
import uploadsRoutes from './routes/uploads.js';

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
const allowedOrigins = new Set([
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
]);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // mobile apps, curl, etc.
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Assign anon_id cookie to track anonymous reactions (must run before routes)
app.use((req, res, next) => {
  if (!req.cookies?.anon_id) {
    const id = crypto.randomUUID();
    res.cookie('anon_id', id, { httpOnly: true, sameSite: 'lax', maxAge: 365*24*60*60*1000 });
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/uploads', uploadsRoutes);

// static files for uploaded images
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const uploadsPath = path.resolve(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Auto-mark today's date as active, schedule daily at local midnight
async function markTodayActive() {
  const today = new Date();
  const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const key = d.toISOString().slice(0, 10);
  try {
    await query(
      `INSERT INTO activity (date, active)
       VALUES ($1::date, TRUE)
       ON CONFLICT (date) DO UPDATE SET active=TRUE`,
      [key]
    );
    console.log('[activity] marked active for', key);
  } catch (e) {
    console.error('[activity] mark error', e.message);
  }
}

function scheduleDailyTask(task) {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0); // next local midnight
  const delay = next.getTime() - now.getTime();
  setTimeout(() => {
    task();
    setInterval(task, 24 * 60 * 60 * 1000);
  }, delay);
}

markTodayActive();
scheduleDailyTask(markTodayActive);

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
