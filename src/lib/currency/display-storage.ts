import type { DisplayCurrency } from "@/lib/nbrb/types";

export const DISPLAY_CURRENCY_KEY = "money-tracker-display-currency";

export function isDisplayCurrency(v: string | null | undefined): v is DisplayCurrency {
  return v === "RUB" || v === "USD";
}

export function readDisplayCurrency(): DisplayCurrency | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DISPLAY_CURRENCY_KEY);
    return isDisplayCurrency(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeDisplayCurrency(c: DisplayCurrency): void {
  try {
    localStorage.setItem(DISPLAY_CURRENCY_KEY, c);
  } catch {
    /* ignore */
  }
}

export function getNextDisplayCurrency(current: DisplayCurrency): DisplayCurrency {
  return current === "RUB" ? "USD" : "RUB";
}
