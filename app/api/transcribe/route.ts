import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }
  const openai = new OpenAI({ apiKey });
  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as File | null;
    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }
    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
    });
    return NextResponse.json({ text: transcription.text ?? "" });
  } catch (err) {
    console.error("[transcribe]", err);
    const message =
      err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
