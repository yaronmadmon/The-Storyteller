import { NextRequest, NextResponse } from "next/server";
import { getIntroduction, updateIntroduction } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  try {
    const { bookId } = await params;
    const intro = await getIntroduction(auth.client, bookId);
    return NextResponse.json({ intro });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch intro" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  try {
    const { bookId } = await params;
    const body = await request.json();
    const { answers } = body as { answers: Record<string, string> };
    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "answers object required" },
        { status: 400 }
      );
    }
    const intro = await updateIntroduction(auth.client, bookId, answers);
    return NextResponse.json({ intro });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update intro" },
      { status: 500 }
    );
  }
}
