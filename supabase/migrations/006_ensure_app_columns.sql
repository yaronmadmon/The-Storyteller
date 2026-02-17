-- Repair: ensure columns required by the app exist (fixes PostgreSQL 42703 undefined_column).
-- Run this in Supabase SQL Editor if you get error 42703. Safe to run multiple times.

-- Books: user_id (required by getBooksForUser, createBook)
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_books_user_id ON public.books(user_id);

-- Books: metadata and publish (required by updateBook)
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS author_name_override TEXT,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS publish_status TEXT DEFAULT 'draft';
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_publish_status_check;
ALTER TABLE public.books
  ADD CONSTRAINT books_publish_status_check
  CHECK (publish_status IN ('draft', 'in_review', 'published'));

-- Chapters: versions (required by updateChapter)
ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS versions JSONB DEFAULT '[]'::jsonb;
