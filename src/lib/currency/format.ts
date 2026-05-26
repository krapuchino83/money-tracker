import type { DisplayCurrency } from "@/lib/nbrb/types";

export function formatCurrency(amount: number, currency: DisplayCurrency): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "RUB" ? 0 : 2,
  }).format(amount);
}

/** Число без символа валюты (для карточек кошельков). */
export function formatAmountPlain(amount: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(amount);
}

/** Сумма в ₽ → отображение в выбранной валюте. */
export function amountRubToDisplay(
  amountRub: number,
  display: DisplayCurrency,
  rubPerUsd: number,
): number {
  if (display === "RUB") return amountRub;
  return rubPerUsd > 0 ? amountRub / rubPerUsd : amountRub;
}
