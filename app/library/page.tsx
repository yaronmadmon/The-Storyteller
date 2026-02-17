import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getBooksForUser } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { BookOpenIcon, PlusCircleIcon } from "lucide-react";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const books = await getBooksForUser(supabase, user.id);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Your library</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/settings">Settings</Link>
            </Button>
            <Button asChild>
              <Link href="/setup">
                <PlusCircleIcon className="mr-2 size-4" />
                New book
              </Link>
            </Button>
          </div>
        </div>

        {books.length === 0 ? (
          <Card className="shadow-xl">
            <CardHeader>
              <h2 className="text-xl font-semibold text-foreground">No books yet</h2>
              <p className="text-muted-foreground">
                Create your first book to start writing with your voice.
              </p>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/setup">
                  <BookOpenIcon className="mr-2 size-4" />
                  Create your first book
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {books.map((book) => (
              <li key={book.id}>
                <Link href={`/dashboard/${book.id}`}>
                  <Card className="h-full shadow-xl transition-colors hover:border-primary/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-2">
                        <BookOpenIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <h2 className="truncate font-semibold text-foreground">
                            {book.description || "Untitled book"}
                          </h2>
                          <p className="text-xs text-muted-foreground capitalize">
                            {book.type}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <span className="text-sm text-primary hover:underline">
                        Open dashboard →
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
