// Uses the secret (RLS-bypassing) key: fail the build if a client component ever imports this.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);
