import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import url from 'url';
import { config } from './config.js';

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
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

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

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
