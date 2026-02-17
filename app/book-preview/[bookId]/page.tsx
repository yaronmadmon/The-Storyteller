import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/PrintButton";
import { createClient } from "@/lib/supabase/server";
import { getBook } from "@/lib/db";
import { getChapters } from "@/lib/db";

export default async function BookPreviewPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const book = await getBook(supabase, bookId);
  if (!book) redirect("/library");

  const chapters = await getChapters(supabase, bookId);
  const sortedChapters = chapters
    .filter((c) => c.polished?.trim())
    .sort((a, b) => a.number - b.number);

  const displayTitle =
    (book.title ?? book.description) || "Untitled";
  const displaySubtitle = book.subtitle ?? (book.description && book.title ? book.description : null);
  const authorName = book.author_name_override ?? null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/${bookId}`}>Back to dashboard</Link>
          </Button>
          <PrintButton />
        </div>

        <article
          className="mx-auto max-w-2xl rounded-lg bg-card px-12 py-16 shadow-lg print:shadow-none print:px-8 text-card-foreground"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {/* Title page */}
          <header className="mb-16 text-center">
            <h1 className="text-4xl font-bold leading-tight text-foreground print:text-5xl">
              {displayTitle}
            </h1>
            {displaySubtitle && (
              <p className="mt-4 text-xl text-muted-foreground print:text-2xl">
                {displaySubtitle}
              </p>
            )}
            {authorName && (
              <p className="mt-8 text-lg text-muted-foreground">by {authorName}</p>
            )}
          </header>

          {/* Chapters */}
          {sortedChapters.map((ch) => (
            <section key={ch.id} className="mb-12">
              <h2 className="mb-6 text-2xl font-semibold text-foreground print:text-3xl">
                Chapter {ch.number}: {ch.title}
              </h2>
              <div
                className="prose prose-lg max-w-none text-foreground prose-p:leading-relaxed prose-p:first-letter:float-left prose-p:first-letter:mr-2 prose-p:first-letter:text-4xl print:prose-p:text-base dark:prose-invert"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {(ch.polished ?? "")
                  .split(/\n\n+/)
                  .filter((p) => p.trim())
                  .map((p, i) => (
                    <p key={i} className="mb-4 text-justify">
                      {p.trim()}
                    </p>
                  ))}
              </div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
