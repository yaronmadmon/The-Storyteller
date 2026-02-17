import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

function isValidSupabaseUrl(url: string): boolean {
  return url.startsWith("https://") && url.includes(".supabase.co");
}

if (!supabaseUrl || !supabaseAnonKey || !isValidSupabaseUrl(supabaseUrl)) {
  throw new Error(
    "Supabase is required. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local. See .env.local.example."
  );
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };
