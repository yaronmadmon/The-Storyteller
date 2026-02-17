"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

type ProfileRow = {
  id: string;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const loadUserAndProfile = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    setUser(u ?? null);
    if (!u) {
      setLoading(false);
      return;
    }
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, display_name, username, bio, avatar_url")
      .eq("id", u.id)
      .single();
    setProfile(profileData ?? null);
    setEditDisplayName(profileData?.display_name ?? "");

    setEditBio(profileData?.bio ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUserAndProfile();
  }, [loadUserAndProfile]);

  useEffect(() => {
    if (profile) {
      setEditDisplayName(profile.display_name ?? "");
      setEditBio(profile.bio ?? "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: editDisplayName.trim() || null,
          bio: editBio.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Profile updated");
      setProfile((p) =>
        p
          ? {
              ...p,
              display_name: editDisplayName.trim() || null,
              bio: editBio.trim() || null,
            }
          : null
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  const providerLabel =
    user.app_metadata?.provider === "google"
      ? "Google"
      : user.app_metadata?.provider === "email"
        ? "Email (magic link)"
        : user.app_metadata?.provider ?? "Email";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Settings
          </h1>
          <Button variant="ghost" asChild>
            <Link href="/library">Library</Link>
          </Button>
        </div>

        {/* Profile */}
        <Card className="shadow-xl">
          <CardHeader>
            <h2 className="font-semibold">Profile</h2>
            <p className="text-sm text-muted-foreground">
              Your account details and how you sign in
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email ?? ""}
                readOnly
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                Signed in with: {providerLabel}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                placeholder="Your name or pen name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="A short bio (optional)"
                rows={3}
                className="resize-none"
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? "Saving…" : "Save profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="shadow-xl">
          <CardHeader>
            <h2 className="font-semibold">Subscription & billing</h2>
            <p className="text-sm text-muted-foreground">
              Your plan and payment
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              The Storyteller is <strong>free to use</strong>. No subscription
              or payment is required. Create books, record chapters, and export
              as Word—all included.
            </p>
            <p className="text-sm text-muted-foreground">
              If we introduce paid plans in the future (e.g. more books, team
              features, or priority support), you’ll be able to manage your plan
              and billing here.
            </p>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="shadow-xl">
          <CardHeader>
            <h2 className="font-semibold">Preferences</h2>
            <p className="text-sm text-muted-foreground">
              Theme and appearance
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={theme ?? "system"}
                onValueChange={(v) => setTheme(v)}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System (match device)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current: {resolvedTheme ?? theme ?? "system"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data & privacy */}
        <Card className="shadow-xl">
          <CardHeader>
            <h2 className="font-semibold">Data & privacy</h2>
            <p className="text-sm text-muted-foreground">
              Export your content and account options
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Export your data</h3>
              <p className="text-sm text-muted-foreground mb-2">
                You can export any book as a Word (.docx) file. Open the book in
                your Library → Dashboard → use the <strong>Export</strong>{" "}
                button to download the full manuscript.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/library">Go to Library</Link>
              </Button>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Delete your account</h3>
              <p className="text-sm text-muted-foreground">
                To permanently delete your account and all your books, chapters,
                and data, please contact support. We’ll process the request and
                confirm once it’s done.
              </p>
              <a
                href="mailto:support@thestoryteller.app?subject=Account%20deletion%20request"
                className="inline-block mt-2 text-sm text-primary hover:underline"
              >
                Request account deletion →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
