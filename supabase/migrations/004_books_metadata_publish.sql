-- Book metadata and publish status (Phase 4)
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS author_name_override TEXT,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS publish_status TEXT DEFAULT 'draft';

-- Constrain publish_status
ALTER TABLE public.books
  DROP CONSTRAINT IF EXISTS books_publish_status_check;
ALTER TABLE public.books
  ADD CONSTRAINT books_publish_status_check
  CHECK (publish_status IN ('draft', 'in_review', 'published'));
