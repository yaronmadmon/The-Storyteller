"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckIcon, FileDownIcon, BookOpenIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import type { Book, Chapter, PublishStatus } from "@/lib/types";
import { getDepthScore, getDepthLabel, getWordCount } from "@/lib/depth";

export default function DashboardPage() {
  const params = useParams();
  const bookId = params.bookId as string;

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editPublishStatus, setEditPublishStatus] = useState<PublishStatus>("draft");

  const loadBook = useCallback(async () => {
    const r = await fetch(`/api/books/${bookId}`);
    const d = await r.json();
    if (!r.ok) throw new Error(d.error ?? "Failed to load book");
    setBook(d.book);
    setEditTitle(d.book.title ?? "");
    setEditSubtitle(d.book.subtitle ?? "");
    setEditDescription(d.book.description ?? "");
    setEditAuthor(d.book.author_name_override ?? "");
    setEditPublishStatus(d.book.publish_status ?? "draft");
  }, [bookId]);

  useEffect(() => {
    setError(null);
    loadBook().catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
    fetch(`/api/books/${bookId}/chapters`)
      .then((r) => r.json())
      .then((d) => setChapters(d.chapters ?? []))
      .catch(() => {});
  }, [bookId, loadBook]);

  const completed = chapters.filter((c) => c.status === "complete").length;
  const total = chapters.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const chaptersWithDepth = chapters.filter((c) => c.polished?.trim());
  const avgDepth =
    chaptersWithDepth.length > 0
      ? Math.round(
          chaptersWithDepth.reduce(
            (s, c) => s + getDepthScore(c.polished, c.checklist ?? []),
            0
          ) / chaptersWithDepth.length
        )
      : 0;
  const depthLabel = getDepthLabel(avgDepth);
  const totalWords = chapters.reduce(
    (sum, ch) => sum + getWordCount(ch.polished ?? ""),
    0
  );

  const handleSaveMetadata = async () => {
    if (!book) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle || null,
          subtitle: editSubtitle || null,
          description: editDescription || book.description,
          author_name_override: editAuthor || null,
          publish_status: editPublishStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setBook(data.book);
      toast.success("Metadata saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 bg-background">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/library">Library</Link>
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
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Book control center</h1>
          <Button variant="ghost" asChild>
            <Link href="/library">Library</Link>
          </Button>
        </div>

        {/* Metadata */}
        <Card className="shadow-xl">
          <CardHeader>
            <h2 className="font-semibold">Metadata</h2>
            <p className="text-sm text-muted-foreground">
              Title, description, and publish status
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Book title (optional)"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Subtitle</label>
              <input
                type="text"
                value={editSubtitle}
                onChange={(e) => setEditSubtitle(e.target.value)}
                placeholder="Subtitle (optional)"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="What's the book about?"
                rows={2}
                className="resize-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Author name (override)</label>
              <input
                type="text"
                value={editAuthor}
                onChange={(e) => setEditAuthor(e.target.value)}
                placeholder="Defaults to your profile name"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Publish status</label>
              <Select
                value={editPublishStatus}
                onValueChange={(v) => setEditPublishStatus(v as PublishStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_review">In review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveMetadata} disabled={saving}>
              {saving ? "Saving…" : "Save metadata"}
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="shadow-xl">
          <CardHeader>
            <h2 className="font-semibold">Stats</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Depth</p>
                <p className="text-xl font-semibold">
                  {avgDepth}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({depthLabel})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Chapters complete</p>
                <p className="text-xl font-semibold">
                  {completed}/{total}
                </p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                {progress >= 100
                  ? "Your book is 100% complete!"
                  : `Your book is ${Math.round(progress)}% complete`}
              </p>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Chapters list */}
        <Card className="shadow-xl">
          <CardHeader>
            <h2 className="font-semibold">Chapters</h2>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {chapters
                .sort((a, b) => a.number - b.number)
                .map((ch) => (
                  <li key={ch.id} className="flex items-center gap-2 text-sm">
                    {ch.status === "complete" ? (
                      <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <span className="inline-block size-4" />
                    )}
                    <span>
                      Chapter {ch.number}: {ch.title}
                    </span>
                  </li>
                ))}
            </ul>
            <p className="mt-4 border-t pt-4 text-sm font-medium text-muted-foreground">
              Words in book: {totalWords.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="shadow-xl">
          <CardHeader>
            <h2 className="font-semibold">Actions</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild>
              <Link href={`/writing/${bookId}?chapter=1`}>
                <BookOpenIcon className="mr-2 size-4" />
                Continue writing
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/book-preview/${bookId}`}>
                <BookOpenIcon className="mr-2 size-4" />
                Preview book
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href={`/api/export/${bookId}`} download>
                <FileDownIcon className="mr-2 size-4" />
                Download .docx
              </a>
            </Button>
            <Button variant="outline" disabled>
              <SendIcon className="mr-2 size-4" />
              Publish (coming soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
