import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import projectsRoutes from './routes/projects.js';
import blogsRoutes from './routes/blogs.js';
import eventsRoutes from './routes/events.js';
import quotesRoutes from './routes/quotes.js';
import activityRoutes from './routes/activity.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // CORS: allow same-origin and common dev origins
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        // In Netlify, functions share the same origin as the site => allow
        return cb(null, true);
      },
      credentials: true,
    })
  );

  // Health
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  // anon_id cookie for anonymous reactions
  app.use((req, res, next) => {
    if (!req.cookies?.anon_id) {
      const id = crypto.randomUUID();
      res.cookie('anon_id', id, { httpOnly: true, sameSite: 'lax', maxAge: 365 * 24 * 60 * 60 * 1000 });
    }
    next();
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/projects', projectsRoutes);
  app.use('/api/blogs', blogsRoutes);
  app.use('/api/events', eventsRoutes);
  app.use('/api/quotes', quotesRoutes);
  app.use('/api/activity', activityRoutes);

  return app;
}
