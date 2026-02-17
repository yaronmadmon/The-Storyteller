"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChapterSidebar } from "@/components/ChapterSidebar";
import { RecordButton } from "@/components/RecordButton";
import { StyleButtons } from "@/components/StyleButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getDepthScore, getDepthLabel, getWordCount } from "@/lib/depth";
import type { Book, Chapter } from "@/lib/types";
import type { StyleOption } from "@/lib/types";

export default function WritingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const chapterNum = parseInt(searchParams.get("chapter") ?? "1", 10) || 1;

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [transcription, setTranscription] = useState("");
  const [polished, setPolished] = useState("");
  const [style, setStyle] = useState<StyleOption>("default");
  const [polishLoading, setPolishLoading] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [nudges, setNudges] = useState<{ area: string; suggestion: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [liveInterim, setLiveInterim] = useState("");

  const currentChapter = chapters.find((c) => Number(c.number) === chapterNum);
  const loadedChapterNumRef = useRef<number | null>(null);

  const fetchBook = useCallback(async () => {
    try {
      const res = await fetch(`/api/books/${bookId}`);
      const data = await res.json();
      if (res.ok) setBook(data.book);
      else {
        setError(data.error ?? "Failed to load book");
      }
    } catch {
      setError("Failed to load book");
    }
  }, [bookId]);

  const fetchChapters = useCallback(async () => {
    try {
      const res = await fetch(`/api/books/${bookId}/chapters`);
      const data = await res.json();
      if (res.ok) setChapters(data.chapters ?? []);
    } catch {
      // Non-fatal for chapters
    }
  }, [bookId]);

  const fetchChapter = useCallback(() => {
    if (!currentChapter) return;
    // Only load chapter data when switching chapters, not when chapters array is refetched.
    // This prevents overwriting the user's transcription right after they record.
    if (loadedChapterNumRef.current !== chapterNum) {
      loadedChapterNumRef.current = chapterNum;
      setTranscription(currentChapter.transcription ?? "");
      setPolished(currentChapter.polished ?? "");
      setStyle((currentChapter.style as StyleOption) ?? "default");
    }
  }, [currentChapter, chapterNum]);

  useEffect(() => {
    fetchBook();
    fetchChapters();
  }, [fetchBook, fetchChapters]);

  useEffect(() => {
    fetchChapter();
  }, [fetchChapter, currentChapter, chapterNum]);

  const handleTranscript = (text: string) => {
    setTranscription(text);
  };

  const handleRecordingStop = () => {
    setLiveInterim("");
    toast.success("Transcription complete");
  };

  const polish = useCallback(
    async (overrideStyle?: StyleOption) => {
      const s = overrideStyle ?? style;
      if (!transcription.trim() || !book || !currentChapter) return;
      setPolishLoading(true);
      try {
        const res = await fetch("/api/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId,
            bookType: book.type,
            description: book.description,
            chapterTitle: currentChapter.title,
            instructions: currentChapter.instructions,
            checklist: currentChapter.checklist,
            transcription,
            style: s,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setPolished(data.polished);
          setStyle(s);
        } else throw new Error(data.error);
      } catch (err) {
        toast.error("Failed to polish. Please try again.");
      } finally {
        setPolishLoading(false);
      }
    },
    [transcription, book, currentChapter, style]
  );

  const handleStyleSelect = (s: StyleOption) => {
    if (polished && s !== style) {
      polish(s);
    } else {
      setStyle(s);
    }
  };

  const saveChapter = useCallback(
    async (opts?: { status?: "draft" | "complete"; thenNavigateTo?: number }) => {
      if (!currentChapter || !book) return;
      const status = opts?.status;
      setSaveLoading(true);
      try {
        const body: Record<string, unknown> = {
          transcription,
          polished,
          style,
        };
        if (status) body.status = status;
        const res = await fetch(
          `/api/books/${bookId}/chapters/${chapterNum}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Failed to save");
        await fetchChapters();
        if (opts?.thenNavigateTo != null) {
          toast.success("Saved, switching chapter");
          router.push(`/writing/${bookId}?chapter=${opts.thenNavigateTo}`);
        } else if (!status || status === "draft") {
          toast.success("Saved");
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save chapter");
      } finally {
        setSaveLoading(false);
      }
    },
    [bookId, chapterNum, currentChapter, book, transcription, polished, style, router, fetchChapters]
  );

  const handleSave = useCallback(() => {
    saveChapter();
  }, [saveChapter]);

  const handleAcceptAndNext = async () => {
    if (!currentChapter || !book) return;
    setAcceptLoading(true);
    try {
      const res = await fetch(
        `/api/books/${bookId}/chapters/${chapterNum}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcription,
            polished,
            style,
            status: "complete",
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      toast.success("Chapter saved!");
      await fetchChapters();
      const total = chapters.length;
      const nextNum = chapterNum + 1;
      if (nextNum <= total) {
        router.push(`/writing/${bookId}?chapter=${nextNum}`);
      } else {
        router.push(`/dashboard/${bookId}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save chapter");
    } finally {
      setAcceptLoading(false);
    }
  };

  const isUnsaved =
    transcription !== (currentChapter?.transcription ?? "") ||
    polished !== (currentChapter?.polished ?? "") ||
    style !== ((currentChapter?.style as StyleOption) ?? "default");

  const handleChapterSelect = useCallback(
    (targetChapterNum: number) => {
      if (targetChapterNum === chapterNum) return;
      if (isUnsaved) {
        saveChapter({ thenNavigateTo: targetChapterNum });
      } else {
        router.push(`/writing/${bookId}?chapter=${targetChapterNum}`);
      }
    },
    [chapterNum, isUnsaved, saveChapter, router, bookId]
  );

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 bg-background">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/setup">Back to Setup</Link>
        </Button>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p>Chapter not found.</p>
        <Link href={`/writing/${bookId}?chapter=1`} className="text-primary underline">Go to Chapter 1</Link>
      </div>
    );
  }

  const canPolish = transcription.trim().length > 0;
  const anySaveLoading = saveLoading || acceptLoading;

  return (
    <div className="flex h-screen overflow-hidden">
      <ChapterSidebar
        bookId={bookId}
        chapters={chapters}
        currentChapterNumber={chapterNum}
        onChapterSelect={handleChapterSelect}
        onChapterAdded={fetchChapters}
        currentChapter={currentChapter}
        currentPolished={polished}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden p-4">
          {/* Middle: Input */}
          <div className="flex flex-col overflow-hidden">
            <Card className="flex flex-1 flex-col overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    Chapter {chapterNum}: {currentChapter.title}
                  </h2>
                  {isUnsaved && (
                    <span className="text-xs text-primary">
                      Unsaved
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentChapter.instructions}
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {currentChapter.checklist.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-muted-foreground">☐</span> {item}
                    </li>
                  ))}
                </ul>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                <RecordButton
                  onTranscript={handleTranscript}
                  onRecordingStop={handleRecordingStop}
                  onInterim={setLiveInterim}
                  currentTranscript={transcription}
                />
                {liveInterim ? (
                  <p className="text-sm text-muted-foreground shrink-0">
                    Listening… <span className="text-foreground">{liveInterim}</span>
                  </p>
                ) : null}
                <ScrollArea className="min-h-0 flex-1">
                  <Textarea
                    placeholder="Your transcription will appear here after you record, or type directly..."
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    className="h-full min-h-[200px] resize-none"
                  />
                </ScrollArea>
                {currentChapter && (
                  <div className="flex-shrink-0 space-y-1 border-t pt-3">
                    <p className="text-xs font-medium text-muted-foreground">Your draft</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold">
                        {getDepthScore(transcription, currentChapter.checklist ?? [])}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getDepthLabel(getDepthScore(transcription, currentChapter.checklist ?? []))}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        · {getWordCount(transcription).toLocaleString()} words
                      </span>
                    </div>
                    <Progress
                      value={getDepthScore(transcription, currentChapter.checklist ?? [])}
                      className="h-1.5"
                    />
                  </div>
                )}
                <Button
                  className="flex-shrink-0"
                  onClick={() => polish()}
                  disabled={!canPolish || polishLoading}
                >
                  {polishLoading ? "Polishing..." : "Polish"}
                </Button>
              </CardContent>
            </Card>
          </div>
          {/* Right: Output */}
          <div className="flex flex-col overflow-hidden">
            <Card className="flex flex-1 flex-col overflow-hidden">
              <CardHeader>
                <h3 className="font-semibold">Polished Version</h3>
                {polished && (
                  <div className="flex flex-wrap items-center gap-2">
                    <StyleButtons
                      selected={style}
                      onSelect={handleStyleSelect}
                      onRegenerate={() => polish()}
                      loading={polishLoading}
                      disabled={!canPolish}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={analyzeLoading || !polished.trim()}
                      onClick={async () => {
                        if (!currentChapter) return;
                        setAnalyzeLoading(true);
                        setNudges([]);
                        try {
                          const res = await fetch("/api/analyze", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              chapterTitle: currentChapter.title,
                              instructions: currentChapter.instructions,
                              checklist: currentChapter.checklist ?? [],
                              polished,
                            }),
                          });
                          const data = await res.json();
                          if (res.ok && data.thinAreas?.length) setNudges(data.thinAreas);
                          else if (!res.ok) throw new Error(data.error);
                        } catch {
                          toast.error("Could not get suggestions");
                        } finally {
                          setAnalyzeLoading(false);
                        }
                      }}
                    >
                      {analyzeLoading ? "Analyzing…" : "Get suggestions"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4 overflow-auto">
                {polished && currentChapter && (
                  <div className="flex-shrink-0 space-y-1 pb-2 border-b">
                    <p className="text-xs font-medium text-muted-foreground">Polished chapter</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold">
                        {getDepthScore(polished, currentChapter.checklist ?? [])}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getDepthLabel(getDepthScore(polished, currentChapter.checklist ?? []))}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        · {getWordCount(polished).toLocaleString()} words
                      </span>
                    </div>
                    <Progress
                      value={getDepthScore(polished, currentChapter.checklist ?? [])}
                      className="h-1.5"
                    />
                  </div>
                )}
                {polished ? (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {polished}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Your polished chapter will appear here after you record and
                    click Polish.
                  </p>
                )}
                {(currentChapter as { versions?: { at: string; polished: string }[] })?.versions?.length ? (
                  <div className="mt-4 border-t pt-4">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Version history
                    </p>
                    <ul className="space-y-1 text-sm">
                      {(
                        (currentChapter as { versions?: { at: string; polished: string }[] })
                          .versions ?? []
                      )
                        .map((v, i) => (
                          <li key={v.at} className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">
                              {new Date(v.at).toLocaleString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={async () => {
                                try {
                                  const res = await fetch(
                                    `/api/books/${bookId}/chapters/${chapterNum}`,
                                    {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        restoreVersionIndex: i,
                                      }),
                                    }
                                  );
                                  const data = await res.json();
                                  if (!res.ok) throw new Error(data.error);
                                  setPolished(data.chapter.polished ?? "");
                                  await fetchChapters();
                                  toast.success("Version restored");
                                } catch {
                                  toast.error("Failed to restore version");
                                }
                              }}
                            >
                              Restore
                            </Button>
                          </li>
                        ))
                        .reverse()}
                    </ul>
                  </div>
                ) : null}
                {nudges.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Suggestions (optional — you choose what to add)
                    </p>
                    <ul className="space-y-2 text-sm">
                      {nudges.map((n, i) => (
                        <li key={i} className="rounded-md bg-muted/50 px-3 py-2">
                          <span className="font-medium">{n.area}:</span>{" "}
                          {n.suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t p-4">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={anySaveLoading || !isUnsaved}
          >
            {saveLoading ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={handleAcceptAndNext}
            disabled={anySaveLoading}
          >
            {acceptLoading ? "Saving..." : "Accept & Next Chapter"}
          </Button>
        </div>
      </div>
    </div>
  );
}
