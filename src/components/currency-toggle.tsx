"use client";

import { DollarSign, RussianRuble } from "lucide-react";

import { useCurrencyRates } from "@/components/currency-rates-provider";
import { Button } from "@/components/ui/button";

export function CurrencyToggle() {
  const { displayCurrency, cycleDisplayCurrency } = useCurrencyRates();
  const isRub = displayCurrency === "RUB";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="rounded-full border-border/60 shadow-sm"
      onClick={cycleDisplayCurrency}
      aria-label={isRub ? "Показывать суммы в долларах" : "Показывать суммы в рублях"}
      title={isRub ? "Отображение: ₽ → $" : "Отображение: $ → ₽"}
    >
      {isRub ? (
        <RussianRuble className="size-4" aria-hidden />
      ) : (
        <DollarSign className="size-4" aria-hidden />
      )}
    </Button>
  );
}
