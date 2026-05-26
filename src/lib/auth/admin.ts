/** Admin email allowlist — server-side only (reads ADMIN_EMAIL / ADMIN_EMAILS). */

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Emails from env: `ADMIN_EMAIL` (single) or `ADMIN_EMAILS` (comma-separated).
 */
export function getAdminEmailSet(): Set<string> {
  const single = process.env.ADMIN_EMAIL?.trim();
  const multi = process.env.ADMIN_EMAILS?.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean) ?? [];
  const set = new Set<string>();
  if (single) {
    set.add(normalizeEmail(single));
  }
  for (const e of multi) {
    set.add(e);
  }
  return set;
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) {
    return false;
  }
  return getAdminEmailSet().has(normalizeEmail(email));
}
