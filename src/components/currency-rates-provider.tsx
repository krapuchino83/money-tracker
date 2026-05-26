"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getNextDisplayCurrency,
  readDisplayCurrency,
  writeDisplayCurrency,
} from "@/lib/currency/display-storage";
import { amountRubToDisplay, formatCurrency } from "@/lib/currency/format";
import type { DisplayCurrency, RubCrossRates } from "@/lib/nbrb/types";

type CurrencyRatesContextValue = {
  rates: RubCrossRates;
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  cycleDisplayCurrency: () => void;
  formatDisplay: (amountRub: number) => string;
  toDisplay: (amountRub: number) => number;
  rubPerUsd: number;
};

const CurrencyRatesContext = createContext<CurrencyRatesContextValue | null>(null);

export function CurrencyRatesProvider({
  rates,
  children,
}: {
  rates: RubCrossRates;
  children: ReactNode;
}) {
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>("RUB");

  const setDisplayCurrency = useCallback((c: DisplayCurrency) => {
    setDisplayCurrencyState(c);
    writeDisplayCurrency(c);
  }, []);

  const cycleDisplayCurrency = useCallback(() => {
    setDisplayCurrencyState((prev) => {
      const next = getNextDisplayCurrency(prev);
      writeDisplayCurrency(next);
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    const stored = readDisplayCurrency();
    if (stored) setDisplayCurrencyState(stored);
  }, []);

  const rubPerUsd = rates.USD;

  const value = useMemo((): CurrencyRatesContextValue => {
    const toDisplay = (amountRub: number) =>
      amountRubToDisplay(amountRub, displayCurrency, rubPerUsd);
    const formatDisplay = (amountRub: number) =>
      formatCurrency(toDisplay(amountRub), displayCurrency);
    return {
      rates,
      displayCurrency,
      setDisplayCurrency,
      cycleDisplayCurrency,
      formatDisplay,
      toDisplay,
      rubPerUsd,
    };
  }, [rates, displayCurrency, setDisplayCurrency, cycleDisplayCurrency, rubPerUsd]);

  return (
    <CurrencyRatesContext.Provider value={value}>{children}</CurrencyRatesContext.Provider>
  );
}

export function useCurrencyRates(): CurrencyRatesContextValue {
  const ctx = useContext(CurrencyRatesContext);
  if (!ctx) {
    throw new Error("useCurrencyRates must be used within CurrencyRatesProvider");
  }
  return ctx;
}
