import { NextRequest, NextResponse } from "next/server";
import { createBook } from "@/lib/db";
import { getTemplate } from "@/lib/templates";
import { requireAuth } from "@/lib/auth";
import type { BookType } from "@/lib/templates";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return "Failed to create book";
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const { type, description } = body as { type: BookType; description: string };
    if (!type || !description?.trim()) {
      return NextResponse.json(
        { error: "type and description are required" },
        { status: 400 }
      );
    }
    const template = getTemplate(type);
    const book = await createBook(
      auth.client,
      auth.user.id,
      type,
      description.trim(),
      template.mode,
      template.chapters
    );
    return NextResponse.json({ book });
  } catch (err) {
    const message = getErrorMessage(err);
    console.error("[api/books]", err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
