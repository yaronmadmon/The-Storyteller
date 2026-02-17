"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckIcon, LayoutDashboardIcon, LightbulbIcon, PlusIcon, TargetIcon } from "lucide-react";
import { toast } from "sonner";
import type { Chapter } from "@/lib/types";

interface ChapterSidebarProps {
  bookId: string;
  chapters: Chapter[];
  currentChapterNumber: number;
  onChapterSelect?: (chapterNumber: number) => void;
  /** Called after a new chapter is added; parent can refetch chapters. */
  onChapterAdded?: (newChapterNumber: number) => void;
  /** Current chapter (for Brain Picker + goals + depth) */
  currentChapter?: Chapter | null;
  /** Current polished text for depth and goals heuristic */
  currentPolished?: string | null;
}

function isGoalTouched(checklistItem: string, polished: string): boolean {
  if (!polished?.trim()) return false;
  const words = polished.trim().split(/\s+/).length;
  const minWords = 25;
  if (words < minWords) return false;
  const lower = polished.toLowerCase();
  const keywords = checklistItem.toLowerCase().replace(/[?.,!]/g, "").split(/\s+/).filter((w) => w.length > 3);
  if (keywords.length === 0) return words >= minWords;
  const matches = keywords.filter((k) => lower.includes(k));
  return matches.length >= Math.min(2, keywords.length);
}

export function ChapterSidebar({
  bookId,
  chapters,
  currentChapterNumber,
  onChapterSelect,
  onChapterAdded,
  currentChapter,
  currentPolished,
}: ChapterSidebarProps) {
  const router = useRouter();
  const [addingChapter, setAddingChapter] = useState(false);
  const completed = chapters.filter((c) => c.status === "complete").length;
  const total = chapters.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="flex h-full w-72 flex-col overflow-hidden border-r bg-muted/30">
      <div className="border-b p-4">
        <Link
          href={`/dashboard/${bookId}`}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <LayoutDashboardIcon className="size-4" />
          Dashboard
        </Link>
      </div>

      {/* Progress */}
      <div className="border-b p-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Your book is {Math.round(progress)}% complete
        </p>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Brain Picker (static) - shrink-0 so chapter list doesn't cover it */}
      {currentChapter && (
        <div className="shrink-0 space-y-4 border-b p-4">
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <LightbulbIcon className="size-3.5" />
              Brain Picker
            </h3>
            <p className="text-sm text-foreground">{currentChapter.instructions}</p>
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <TargetIcon className="size-3.5" />
              Chapter goals
            </h3>
            <ul className="space-y-1.5 text-sm">
              {(currentChapter.checklist ?? []).map((item, i) => {
                const touched = currentPolished ? isGoalTouched(item, currentPolished) : false;
                return (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-muted-foreground">
                      {touched ? "☑" : "☐"}
                    </span>
                    <span className={touched ? "text-foreground" : "text-muted-foreground"}>
                      {item}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <ScrollArea className="min-h-0 flex-1 px-2">
        <nav className="space-y-1 py-4">
          {chapters.map((ch) => {
            const isCurrent = Number(ch.number) === currentChapterNumber;
            const href = `/writing/${bookId}?chapter=${ch.number}`;
            const className = `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
              isCurrent
                ? "bg-primary text-primary-foreground"
                : ch.status === "complete"
                  ? "text-muted-foreground hover:bg-muted"
                  : "hover:bg-muted"
            }`;
            return onChapterSelect && !isCurrent ? (
              <button
                key={ch.id}
                type="button"
                onClick={() => onChapterSelect(Number(ch.number))}
                className={`w-full text-left ${className}`}
              >
                {ch.status === "complete" ? (
                  <CheckIcon className="size-4 shrink-0" />
                ) : (
                  <span className="inline-block size-4 shrink-0" />
                )}
                <span className="truncate">
                  Chapter {ch.number}: {ch.title}
                </span>
              </button>
            ) : (
              <Link key={ch.id} href={href} className={className}>
                {ch.status === "complete" ? (
                  <CheckIcon className="size-4 shrink-0" />
                ) : (
                  <span className="inline-block size-4 shrink-0" />
                )}
                <span className="truncate">
                  {isCurrent ? "→ " : ""}
                  Chapter {ch.number}: {ch.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          disabled={addingChapter}
          onClick={async () => {
            setAddingChapter(true);
            try {
              const res = await fetch(`/api/books/${bookId}/chapters`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error ?? "Failed to add chapter");
              const newNumber = Number(data.chapter?.number ?? 0);
              onChapterAdded?.(newNumber);
              router.push(`/writing/${bookId}?chapter=${newNumber}`);
              toast.success("Chapter added");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to add chapter");
            } finally {
              setAddingChapter(false);
            }
          }}
        >
          <PlusIcon className="size-4" />
          {addingChapter ? "Adding…" : "Add a chapter"}
        </Button>
      </div>
    </div>
  );
}
