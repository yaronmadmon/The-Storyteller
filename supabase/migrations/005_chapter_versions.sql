-- Version history for polished chapter content (Phase 7)
ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS versions JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.chapters.versions IS 'Array of { at: iso timestamp, polished: string } for restore';
