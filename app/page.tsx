import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/library");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <Card className="w-full shadow-xl">
          <CardHeader className="space-y-2 pb-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Turn Your Story Into a Book
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Just talk. We&apos;ll write it.
            </p>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              Speak naturally about your experiences, ideas, or imagination. AI
              organizes and polishes your words into structured chapters—no
              writing knowledge required.
            </p>
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
