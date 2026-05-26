import "server-only";

import type { User } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminUserRow } from "@/lib/types/admin-user";
import { isProFromProfile, type ProProfile } from "@/lib/subscription/pro";

type ProfileProRow = Pick<ProProfile, "subscription_status" | "pro_current_period_end">;

async function fetchProProfilesByUserIds(
  userIds: string[],
): Promise<Map<string, ProfileProRow>> {
  const map = new Map<string, ProfileProRow>();
  if (userIds.length === 0) {
    return map;
  }

  const admin = createAdminClient();
  const chunkSize = 200;
  for (let i = 0; i < userIds.length; i += chunkSize) {
    const chunk = userIds.slice(i, i + chunkSize);
    const { data, error } = await admin
      .from("profiles")
      .select("user_id, subscription_status, pro_current_period_end")
      .in("user_id", chunk);

    if (error) {
      throw new Error(error.message);
    }

    for (const row of data ?? []) {
      map.set(row.user_id, {
        subscription_status: row.subscription_status ?? "none",
        pro_current_period_end: row.pro_current_period_end,
      });
    }
  }

  return map;
}

function mapUser(u: User, profile: ProfileProRow | undefined): AdminUserRow {
  const banned = Boolean(u.banned_until && new Date(u.banned_until) > new Date());
  const subscription_status = profile?.subscription_status ?? "none";
  const pro_current_period_end = profile?.pro_current_period_end ?? null;

  return {
    id: u.id,
    email: u.email,
    created_at: u.created_at ?? "",
    banned,
    is_pro: isProFromProfile(
      profile
        ? { ...profile, stripe_customer_id: null }
        : null,
    ),
    subscription_status,
    pro_current_period_end,
  };
}

export async function listAllAuthUsersForAdmin(): Promise<{
  users: AdminUserRow[];
  error: string | null;
}> {
  try {
    const admin = createAdminClient();
    const users: User[] = [];
    let page = 1;
    const perPage = 200;
    for (;;) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) {
        return { users: [], error: error.message };
      }
      users.push(...data.users);
      if (data.users.length < perPage) {
        break;
      }
      page += 1;
      if (page > 40) {
        break;
      }
    }
    const profiles = await fetchProProfilesByUserIds(users.map((u) => u.id));
    return {
      users: users.map((u) => mapUser(u, profiles.get(u.id))),
      error: null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Не удалось загрузить пользователей";
    return { users: [], error: msg };
  }
}
