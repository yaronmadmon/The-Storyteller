import { NextRequest, NextResponse } from "next/server";
import { getBook, getChapters, createChapter } from "@/lib/db";
import { getTemplate } from "@/lib/templates";
import { requireAuth } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  try {
    const { bookId } = await params;
    const chapter = await createChapter(auth.client, bookId);
    return NextResponse.json({ chapter });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to add chapter" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  try {
    const { bookId } = await params;
    let chapters = await getChapters(auth.client, bookId);

    if (chapters.length === 0) {
      const book = await getBook(auth.client, bookId);
      if (book) {
        const template = getTemplate(book.type);
        const { error } = await auth.client.from("chapters").insert(
          template.chapters.map((ch) => ({
            book_id: bookId,
            number: ch.number,
            title: ch.title,
            instructions: ch.instructions,
            checklist: ch.checklist ?? [],
          }))
        );
        if (!error) chapters = await getChapters(auth.client, bookId);
      }
    }

    return NextResponse.json({ chapters });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}
