-- Run this in Supabase Dashboard → SQL Editor
-- Creates the tables required for The Storyteller app

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  mode TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  number INT NOT NULL,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  checklist JSONB NOT NULL DEFAULT '[]',
  transcription TEXT,
  polished TEXT,
  style TEXT NOT NULL DEFAULT 'default',
  word_count INT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Introductions table
CREATE TABLE IF NOT EXISTS introductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(book_id)
);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE introductions ENABLE ROW LEVEL SECURITY;

-- Policies: allow anon access for all operations (no auth in this app)
CREATE POLICY "Allow all on books" ON books FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on chapters" ON chapters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on introductions" ON introductions FOR ALL USING (true) WITH CHECK (true);
