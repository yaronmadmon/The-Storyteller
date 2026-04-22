-- Paste this entire file into Supabase Dashboard → SQL Editor → New query → Run
-- Fixes error 42703 (undefined column). Safe to run multiple times.

ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_books_user_id ON public.books(user_id);

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

ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS versions JSONB DEFAULT '[]'::jsonb;

-- Fix RLS: drop permissive open policies and enforce user ownership
DROP POLICY IF EXISTS "Allow all on books" ON public.books;
DROP POLICY IF EXISTS "Allow all on chapters" ON public.chapters;
DROP POLICY IF EXISTS "Allow all on introductions" ON public.introductions;

-- Books: users can only access their own books
CREATE POLICY "Users can manage their own books"
  ON public.books FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Chapters: access allowed only if the parent book belongs to the user
CREATE POLICY "Users can manage chapters of their own books"
  ON public.chapters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = chapters.book_id
        AND books.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = chapters.book_id
        AND books.user_id = auth.uid()
    )
  );

-- Introductions: same — access only via owned books
CREATE POLICY "Users can manage introductions of their own books"
  ON public.introductions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = introductions.book_id
        AND books.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = introductions.book_id
        AND books.user_id = auth.uid()
    )
  );
