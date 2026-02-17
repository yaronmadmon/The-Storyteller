import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type AuthResult =
  | { user: User; client: SupabaseClient }
  | { response: NextResponse };

/** Get the current user and server Supabase client. Returns 401 response if not authenticated. */
export async function requireAuth(): Promise<AuthResult> {
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, client };
}
