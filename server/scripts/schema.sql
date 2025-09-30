-- Schema for Portfolio PERN backend
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profile (singleton row id=1)
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY DEFAULT 1,
  display_name TEXT,
  title TEXT,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb
);
-- About fields
ALTER TABLE profile ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS expertise TEXT;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS profile_summary TEXT;

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  repo_url TEXT,
  demo_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blogs
CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content_md TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);

-- Comments (public)
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comments_blog_id ON comments(blog_id);

-- Reactions per comment
CREATE TABLE IF NOT EXISTS comment_reactions (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE (comment_id, type)
);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);

-- Events (link to blog/project/note via ref_type/ref_id)
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  ref_type TEXT CHECK (ref_type IN ('blog', 'project', 'note')),
  ref_id INTEGER
);
CREATE INDEX IF NOT EXISTS idx_events_start_at ON events(start_at);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT
);

-- Activity (daily active/inactive)
CREATE TABLE IF NOT EXISTS activity (
  date DATE PRIMARY KEY,
  active BOOLEAN NOT NULL DEFAULT FALSE
);
