"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RecordButton } from "@/components/RecordButton";
import { toast } from "sonner";
import { getTemplate } from "@/lib/templates";
import type { Book } from "@/lib/types";

export default function IntroPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;

  const [book, setBook] = useState<Book | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const template = book ? getTemplate(book.mode) : null;
  const questions = template?.introQuestions ?? [];

  useEffect(() => {
    setError(null);
    fetch(`/api/books/${bookId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Failed to load book");
        return d;
      })
      .then((d) => d.book && setBook(d.book))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
    fetch(`/api/books/${bookId}/intro`)
      .then((r) => r.json())
      .then((d) => d.intro?.answers && setAnswers(d.intro.answers))
      .catch(() => {});
  }, [bookId]);

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}/intro`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  }, [bookId, answers]);

  const handleContinue = async () => {
    await handleSave();
    router.push(`/writing/${bookId}?chapter=1`);
  };

  const handleTranscriptForField = (questionId: string) => (text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6">
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

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-6">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <h1 className="text-2xl font-bold text-foreground">
            Your Story in a Few Words
          </h1>
          <p className="text-muted-foreground">
            Answer these questions to give your book context. Use voice or type.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q) => (
            <div key={q.id}>
              <label className="mb-2 block text-sm font-medium text-foreground">{q.question}</label>
              <div className="flex gap-2">
                <Textarea
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  placeholder="Type or use voice..."
                  rows={2}
                />
                <div className="flex flex-col">
                  <RecordButton
                    onTranscript={handleTranscriptForField(q.id)}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-between pt-4">
            <Button variant="outline" asChild>
              <Link href="/setup">Back</Link>
            </Button>
            <Button onClick={handleContinue} disabled={loading}>
              {loading ? "Saving..." : "Continue to Chapter 1"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
