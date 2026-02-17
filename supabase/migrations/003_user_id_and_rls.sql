-- Add user_id to books (ownership)
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_books_user_id ON public.books(user_id);

-- Drop permissive policies
DROP POLICY IF EXISTS "Allow all on books" ON public.books;
DROP POLICY IF EXISTS "Allow all on chapters" ON public.chapters;
DROP POLICY IF EXISTS "Allow all on introductions" ON public.introductions;

-- Books: user can only access own rows
CREATE POLICY "Users can view own books"
  ON public.books FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own books"
  ON public.books FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own books"
  ON public.books FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own books"
  ON public.books FOR DELETE
  USING (user_id = auth.uid());

-- Chapters: access via book ownership
CREATE POLICY "Users can view chapters of own books"
  ON public.chapters FOR SELECT
  USING (
    book_id IN (SELECT id FROM public.books WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert chapters for own books"
  ON public.chapters FOR INSERT
  WITH CHECK (
    book_id IN (SELECT id FROM public.books WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update chapters of own books"
  ON public.chapters FOR UPDATE
  USING (
    book_id IN (SELECT id FROM public.books WHERE user_id = auth.uid())
  )
  WITH CHECK (
    book_id IN (SELECT id FROM public.books WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete chapters of own books"
  ON public.chapters FOR DELETE
  USING (
    book_id IN (SELECT id FROM public.books WHERE user_id = auth.uid())
  );

-- Introductions: access via book ownership
CREATE POLICY "Users can view introductions of own books"
  ON public.introductions FOR SELECT
  USING (
    book_id IN (SELECT id FROM public.books WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert introductions for own books"
  ON public.introductions FOR INSERT
  WITH CHECK (
    book_id IN (SELECT id FROM public.books WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update introductions of own books"
  ON public.introductions FOR UPDATE
  USING (
    book_id IN (SELECT id FROM public.books WHERE user_id = auth.uid())
  )
  WITH CHECK (
    book_id IN (SELECT id FROM public.books WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete introductions of own books"
  ON public.introductions FOR DELETE
  USING (
    book_id IN (SELECT id FROM public.books WHERE user_id = auth.uid())
  );
