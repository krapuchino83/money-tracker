import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const envPath = resolve(import.meta.dirname, "..", ".env.local");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  const k = t.slice(0, i).trim();
  let v = t.slice(i + 1).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  process.env[k] = v;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list, error: listErr } = await admin.auth.admin.listUsers({
  perPage: 1000,
});
if (listErr) throw listErr;

const user = list.users.find((u) => (u.email || "").toLowerCase() === email);
if (!user) {
  console.error("Пользователь не найден:", email);
  process.exit(1);
}

const { data, error } = await admin
  .from("profiles")
  .update({
    stripe_subscription_id: null,
    subscription_status: "none",
    pro_current_period_end: null,
  })
  .eq("user_id", user.id)
  .select("subscription_status, stripe_subscription_id, pro_current_period_end")
  .single();

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log("PRO сброшен для", email);
console.log(data);
