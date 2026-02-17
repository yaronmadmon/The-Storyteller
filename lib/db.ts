import type { SupabaseClient } from "@supabase/supabase-js";
import type { Book, Chapter, Introduction } from "./types";
import type { ChapterTemplate } from "./templates";

export async function createBook(
  client: SupabaseClient,
  userId: string,
  type: Book["type"],
  description: string,
  mode: Book["mode"],
  chapterTemplates: ChapterTemplate[]
): Promise<Book> {
  const { data: bookData, error: bookError } = await client
    .from("books")
    .insert({
      user_id: userId,
      type,
      description,
      mode,
    })
    .select("*")
    .single();
  if (bookError) throw bookError;
  const book = bookData as unknown as Book;

  if (chapterTemplates.length > 0) {
    const { error: chaptersError } = await client.from("chapters").insert(
      chapterTemplates.map((ch) => ({
        book_id: book.id,
        number: ch.number,
        title: ch.title,
        instructions: ch.instructions,
        checklist: ch.checklist ?? [],
      }))
    );
    if (chaptersError) throw chaptersError;
  }

  return book;
}

export async function getBook(client: SupabaseClient, id: string): Promise<Book | null> {
  const { data, error } = await client.from("books").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as unknown as Book;
}

export async function updateBook(
  client: SupabaseClient,
  id: string,
  updates: Partial<Pick<Book, "title" | "subtitle" | "description" | "author_name_override" | "cover_url" | "publish_status">>
): Promise<Book> {
  const { data, error } = await client
    .from("books")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error("Book not found");
  return data as unknown as Book;
}

export async function getChapters(client: SupabaseClient, bookId: string): Promise<Chapter[]> {
  const { data, error } = await client
    .from("chapters")
    .select("*")
    .eq("book_id", bookId)
    .order("number", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Chapter[];
}

export async function createChapter(
  client: SupabaseClient,
  bookId: string
): Promise<Chapter> {
  const chapters = await getChapters(client, bookId);
  const nextNumber = chapters.length === 0 ? 1 : Math.max(...chapters.map((c) => Number(c.number))) + 1;
  const { data, error } = await client
    .from("chapters")
    .insert({
      book_id: bookId,
      number: nextNumber,
      title: `Chapter ${nextNumber}`,
      instructions: "Write this chapter. Share your story in your own words.",
      checklist: [],
    })
    .select("*")
    .single();
  if (error) throw error;
  if (!data) throw new Error("Failed to create chapter");
  return data as unknown as Chapter;
}

function chapterNumberMatch(c: Chapter, n: number): boolean {
  return Number(c.number) === Number(n);
}

export async function getChapter(
  client: SupabaseClient,
  bookId: string,
  chapterNumber: number
): Promise<Chapter | null> {
  const chapters = await getChapters(client, bookId);
  return chapters.find((c) => chapterNumberMatch(c, chapterNumber)) ?? null;
}

export async function updateChapter(
  client: SupabaseClient,
  bookId: string,
  chapterNumber: number,
  updates: Partial<Pick<Chapter, "transcription" | "polished" | "style" | "status">>
): Promise<Chapter> {
  const chapters = await getChapters(client, bookId);
  const chapter = chapters.find((c) => chapterNumberMatch(c, chapterNumber));
  if (!chapter) throw new Error("Chapter not found");

  const updated: Chapter = {
    ...chapter,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (updates.polished !== undefined) {
    updated.word_count = updates.polished
      ? updates.polished.split(/\s+/).filter(Boolean).length
      : null;
  }

  const MAX_VERSIONS = 10;
  let newVersions = (chapter as Chapter & { versions?: { at: string; polished: string }[] }).versions ?? [];
  if (updates.polished !== undefined && updates.polished?.trim()) {
    newVersions = [
      ...newVersions,
      { at: updated.updated_at, polished: updates.polished },
    ].slice(-MAX_VERSIONS);
  }

  const { data, error } = await client
    .from("chapters")
    .update({
      transcription: updated.transcription,
      polished: updated.polished,
      style: updated.style,
      status: updated.status,
      word_count: updated.word_count,
      updated_at: updated.updated_at,
      ...(newVersions.length > 0 && { versions: newVersions }),
    })
    .eq("id", chapter.id)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error("Chapter not found");
  return data as unknown as Chapter;
}

export async function createIntroduction(
  client: SupabaseClient,
  bookId: string,
  answers: Record<string, string>
): Promise<Introduction> {
  const { data, error } = await client
    .from("introductions")
    .insert({ book_id: bookId, answers })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as Introduction;
}

export async function getIntroduction(
  client: SupabaseClient,
  bookId: string
): Promise<Introduction | null> {
  const { data, error } = await client
    .from("introductions")
    .select("*")
    .eq("book_id", bookId)
    .single();
  if (error || !data) return null;
  return data as unknown as Introduction;
}

export async function updateIntroduction(
  client: SupabaseClient,
  bookId: string,
  answers: Record<string, string>
): Promise<Introduction> {
  const intro = await getIntroduction(client, bookId);
  if (intro) {
    const { data, error } = await client
      .from("introductions")
      .update({ answers, updated_at: new Date().toISOString() })
      .eq("id", intro.id)
      .select("*")
      .single();
    if (error) throw error;
    return data as unknown as Introduction;
  }
  return createIntroduction(client, bookId, answers);
}

/** List books for a user (uses RLS when client has session). Use server client. */
export async function getBooksForUser(
  client: SupabaseClient,
  userId: string
): Promise<Book[]> {
  const { data, error } = await client
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Book[];
}
