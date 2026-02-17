import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  buildRewriteSystemPrompt,
  buildRewriteUserPrompt,
} from "@/lib/prompts";
import { requireAuth } from "@/lib/auth";
import { getIntroduction } from "@/lib/db";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }
  const openai = new OpenAI({ apiKey });
  try {
    const body = await request.json();
    const {
      bookId,
      bookType,
      description,
      chapterTitle,
      instructions,
      checklist,
      transcription,
      style,
    } = body as {
      bookId?: string;
      bookType: string;
      description: string;
      chapterTitle: string;
      instructions: string;
      checklist: string[];
      transcription: string;
      style?: string;
    };

    if (!transcription?.trim()) {
      return NextResponse.json(
        { error: "Transcription is required" },
        { status: 400 }
      );
    }

    let introAnswers: Record<string, string> | null = null;
    if (bookId) {
      const intro = await getIntroduction(auth.client, bookId);
      if (intro?.answers && typeof intro.answers === "object") {
        introAnswers = intro.answers as Record<string, string>;
      }
    }

    const systemPrompt = buildRewriteSystemPrompt(
      bookType ?? "book",
      description ?? "",
      introAnswers
    );
    const userPrompt = buildRewriteUserPrompt(
      chapterTitle ?? "",
      instructions ?? "",
      checklist ?? [],
      transcription,
      style
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const polished =
      completion.choices[0]?.message?.content?.trim() ??
      transcription;
    return NextResponse.json({ polished });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Rewrite failed";
    return NextResponse.json(
      { error: "Rewrite failed", details: message },
      { status: 500 }
    );
  }
}
