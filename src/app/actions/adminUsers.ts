"use server";

import { revalidatePath } from "next/cache";

import { isAdminEmail } from "@/lib/auth/admin";
import { ensureAdminProfileRole } from "@/lib/auth/sync-admin-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const userIdSchema = z.string().uuid();

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !isAdminEmail(user.email)) {
    throw new Error("Нет прав администратора");
  }
  await ensureAdminProfileRole(user.id, user.email);
  return user;
}

export async function banUser(formData: FormData) {
  const adminUser = await requireAdminUser();
  const parsed = userIdSchema.safeParse(formData.get("userId")?.toString());
  if (!parsed.success) {
    return { ok: false as const, error: "Некорректный id" };
  }
  if (parsed.data === adminUser.id) {
    return { ok: false as const, error: "Нельзя заблокировать себя" };
  }
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(parsed.data, {
      ban_duration: "876600h",
    });
    if (error) {
      return { ok: false as const, error: error.message };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка сервера";
    return { ok: false as const, error: msg };
  }
  revalidatePath("/admin/users");
  return { ok: true as const };
}

export async function unbanUser(formData: FormData) {
  await requireAdminUser();
  const parsed = userIdSchema.safeParse(formData.get("userId")?.toString());
  if (!parsed.success) {
    return { ok: false as const, error: "Некорректный id" };
  }
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(parsed.data, {
      ban_duration: "none",
    });
    if (error) {
      return { ok: false as const, error: error.message };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка сервера";
    return { ok: false as const, error: msg };
  }
  revalidatePath("/admin/users");
  return { ok: true as const };
}

export async function deleteUser(formData: FormData) {
  const adminUser = await requireAdminUser();
  const parsed = userIdSchema.safeParse(formData.get("userId")?.toString());
  if (!parsed.success) {
    return { ok: false as const, error: "Некорректный id" };
  }
  if (parsed.data === adminUser.id) {
    return { ok: false as const, error: "Нельзя удалить свою учётную запись" };
  }
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(parsed.data);
    if (error) {
      return { ok: false as const, error: error.message };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка сервера";
    return { ok: false as const, error: msg };
  }
  revalidatePath("/admin/users");
  return { ok: true as const };
}
