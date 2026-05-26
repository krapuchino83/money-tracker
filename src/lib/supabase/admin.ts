import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseUrl } from "./env";

/**
 * Service role client — Auth Admin API + обход RLS для `profiles`.
 * Только сервер; никогда не импортировать из client components.
 */
export function createAdminClient() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL. Добавьте service role в .env.local (сервер только).",
    );
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
