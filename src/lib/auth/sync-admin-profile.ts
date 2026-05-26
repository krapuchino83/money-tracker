import "server-only";

import { isAdminEmail } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

/** Если email в ADMIN_EMAIL — выставить role=admin в public.profiles. */
export async function ensureAdminProfileRole(userId: string, email: string | undefined | null) {
  if (!isAdminEmail(email)) {
    return;
  }
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("profiles").upsert(
      { user_id: userId, role: "admin" },
      { onConflict: "user_id" },
    );
    if (error) {
      console.error("ensureAdminProfileRole:", error.message);
    }
  } catch {
    // Нет SUPABASE_SERVICE_ROLE_KEY или миграции profiles — тихо; админка покажет ошибку при списке.
  }
}
