"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOK_TYPE_LABELS,
  type BookType,
} from "@/lib/templates";

export default function SetupPage() {
  const router = useRouter();
  const [bookType, setBookType] = useState<BookType | "">("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookType || !description.trim()) {
      setError("Please select a book type and describe your book.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: bookType, description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create book");
      router.push(`/writing/${data.book.id}?chapter=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <h1 className="text-2xl font-bold text-foreground">Set Up Your Book</h1>
          <p className="text-muted-foreground">
            Two quick questions and you&apos;re ready to start.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                What type of book are you writing?
              </label>
              <Select
                value={bookType}
                onValueChange={(v) => setBookType(v as BookType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(BOOK_TYPE_LABELS) as [BookType, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                In one sentence, what&apos;s it about?
              </label>
              <Textarea
                placeholder="e.g. My journey from homeless to successful entrepreneur"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Start Writing"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Back</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
