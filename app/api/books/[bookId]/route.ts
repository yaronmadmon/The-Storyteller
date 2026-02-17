import { NextRequest, NextResponse } from "next/server";
import { getBook, updateBook } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import type { PublishStatus } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  try {
    const { bookId } = await params;
    const book = await getBook(auth.client, bookId);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    return NextResponse.json({ book });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  try {
    const { bookId } = await params;
    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      author_name_override,
      cover_url,
      publish_status,
    } = body as {
      title?: string | null;
      subtitle?: string | null;
      description?: string;
      author_name_override?: string | null;
      cover_url?: string | null;
      publish_status?: PublishStatus;
    };
    const book = await updateBook(auth.client, bookId, {
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle }),
      ...(description !== undefined && { description }),
      ...(author_name_override !== undefined && { author_name_override }),
      ...(cover_url !== undefined && { cover_url }),
      ...(publish_status !== undefined && { publish_status }),
    });
    return NextResponse.json({ book });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    );
  }
}
