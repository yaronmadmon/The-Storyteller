import { NextRequest, NextResponse } from "next/server";
import { getChapter, updateChapter } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string; chapterNumber: string }> }
) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  try {
    const { bookId, chapterNumber } = await params;
    const num = parseInt(chapterNumber, 10);
    if (isNaN(num)) {
      return NextResponse.json({ error: "Invalid chapter number" }, { status: 400 });
    }
    const chapter = await getChapter(auth.client, bookId, num);
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }
    return NextResponse.json({ chapter });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string; chapterNumber: string }> }
) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  try {
    const { bookId, chapterNumber } = await params;
    const num = parseInt(chapterNumber, 10);
    if (isNaN(num)) {
      return NextResponse.json({ error: "Invalid chapter number" }, { status: 400 });
    }
    const body = await request.json();
    const { transcription, polished, style, status, restoreVersionIndex } = body;
    let updates: Parameters<typeof updateChapter>[3] = {
      ...(transcription !== undefined && { transcription }),
      ...(polished !== undefined && { polished }),
      ...(style !== undefined && { style }),
      ...(status !== undefined && { status }),
    };
    if (typeof restoreVersionIndex === "number") {
      const existing = await getChapter(auth.client, bookId, num);
      if (!existing) {
        return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
      }
      const versions = (existing as { versions?: { at: string; polished: string }[] }).versions ?? [];
      const entry = versions[restoreVersionIndex];
      if (!entry?.polished) {
        return NextResponse.json({ error: "Version not found" }, { status: 400 });
      }
      updates = { ...updates, polished: entry.polished };
    }
    const chapter = await updateChapter(auth.client, bookId, num, updates);
    return NextResponse.json({ chapter });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Failed to update chapter";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
