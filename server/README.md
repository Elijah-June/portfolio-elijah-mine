# Portfolio Server (PERN)

Express + Postgres (Neon) backend for the personal portfolio.

## Quick start

1. Copy `.env.example` to `.env` and fill values (DATABASE_URL, JWT secrets, CLIENT_URL, admin creds, etc.)
2. Install deps
   - npm install
3. Initialize database
   - npm run db:init
4. Seed admin and quotes
   - npm run db:seed
5. Start dev server
   - npm run dev

Server runs on http://localhost:4000 by default.

## API

- Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/refresh`
- Profile: `GET /api/profile`, `PUT /api/profile` (admin)
- Projects: `GET /api/projects`, `POST/PUT/DELETE` (admin)
- Blogs: `GET /api/blogs`, `GET /api/blogs/:slug`, `POST/PUT/DELETE` (admin)
- Comments (public): `GET /api/blogs/:id/comments`, `POST /api/blogs/:id/comments`; Admin: `GET /api/blogs/:id/comments/all`, `PUT/DELETE /api/blogs/comments/:commentId`
- Events: `GET /api/events`, `POST/PUT/DELETE` (admin)
- Quotes: `GET /api/quotes/daily`

## Notes

- Cookies are httpOnly and require the browser to include credentials. Configure the client to send `credentials: 'include'` and CORS origin to `CLIENT_URL`.
- No registration endpoint. Use `scripts/seed.js` to set the admin user via env vars.
- For Neon, ensure `?sslmode=require` or SSL is enabled. This setup forces SSL in production or when using hosted DBs.
