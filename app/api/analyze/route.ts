import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { requireAuth } from "@/lib/auth";

/**
 * Thin-area analysis: identify underdeveloped sections and suggest nudges.
 * Does NOT rewrite or generate narrative. Returns structured feedback only.
 */
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

  try {
    const body = await request.json();
    const { chapterTitle, instructions, checklist, polished } = body as {
      chapterTitle: string;
      instructions: string;
      checklist: string[];
      polished: string;
    };

    if (!polished?.trim()) {
      return NextResponse.json(
        { error: "Polished text is required" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an editorial analyst. You do NOT write or rewrite any content. You only analyze and suggest.

Your task: identify "thin" (underdeveloped) areas in the chapter and suggest what the author could add. Output a JSON array of objects with keys: "area" (short label, e.g. "Opening paragraph"), "suggestion" (one short question or prompt to help the author expand, e.g. "What did the room look like?" or "How did you feel in this moment?"). Maximum 5 items. If the chapter is well developed, return [].

Rules: Never invent or assume story content. Only ask questions or suggest directions. Output valid JSON only, no other text.`,
        },
        {
          role: "user",
          content: `Chapter: ${chapterTitle}
Instructions: ${instructions}
Checklist: ${(checklist ?? []).join("; ")}

Polished text to analyze:
---
${polished.slice(0, 6000)}
---

Return a JSON array of thin-area suggestions, e.g. [{"area": "...", "suggestion": "..."}].`,
        },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "[]";
    let thinAreas: { area: string; suggestion: string }[] = [];
    try {
      const parsed = JSON.parse(raw);
      thinAreas = Array.isArray(parsed)
        ? parsed.filter(
            (x: unknown) =>
              x &&
              typeof x === "object" &&
              "area" in x &&
              "suggestion" in x &&
              typeof (x as { area: unknown }).area === "string" &&
              typeof (x as { suggestion: unknown }).suggestion === "string"
          )
        : [];
    } catch {
      thinAreas = [];
    }

    return NextResponse.json({ thinAreas });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
