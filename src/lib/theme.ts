export const THEME_STORAGE_KEY = "money-tracker-theme";

export const THEME_IDS = ["light", "dark"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const THEME_ORDER: ThemeId[] = [...THEME_IDS];

/** Старые значения из четырёх тем — мягкая миграция. */
const LEGACY_MAP: Record<string, ThemeId> = {
  fallout: "dark",
  mario: "light",
};

export function isThemeId(raw: string | null | undefined): raw is ThemeId {
  return raw != null && (THEME_IDS as readonly string[]).includes(raw);
}

export function normalizeStoredTheme(raw: string | null): ThemeId | null {
  if (raw == null) return null;
  if (isThemeId(raw)) return raw;
  const mapped = LEGACY_MAP[raw];
  return mapped ?? null;
}

export function getNextTheme(current: ThemeId): ThemeId {
  const i = THEME_ORDER.indexOf(current);
  return THEME_ORDER[(i + 1) % THEME_ORDER.length];
}

/** Класс `dark` на `<html>` только для тёмной темы (tailwind `dark:`). */
export function themeUsesDarkUiClass(theme: ThemeId): boolean {
  return theme === "dark";
}

export function applyThemeToDocument(theme: ThemeId): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", themeUsesDarkUiClass(theme));
}

export function readStoredTheme(): ThemeId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return normalizeStoredTheme(raw);
  } catch {
    return null;
  }
}

export function writeStoredTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function resolveInitialTheme(): ThemeId {
  if (typeof window === "undefined") return "light";
  const stored = readStoredTheme();
  if (stored) return stored;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export function getThemeInlineScriptPayload(): {
  key: string;
  valid: ThemeId[];
} {
  return { key: THEME_STORAGE_KEY, valid: [...THEME_ORDER] };
}
