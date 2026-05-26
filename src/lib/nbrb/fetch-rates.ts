import type { NbrbRate, RubCrossRates } from "@/lib/nbrb/types";

const NBRB_BASE = "https://api.nbrb.by/exrates/rates";

const CROSS_CURRENCIES = ["USD", "EUR", "CNY", "RUB"] as const;

function bynPerUnit(rate: NbrbRate): number {
  return rate.Cur_OfficialRate / rate.Cur_Scale;
}

/** ₽ за 1 единицу валюты через кросс-курс BYN (курсы НБРБ). */
export function rubPerUnitFromNbrb(rates: Record<string, NbrbRate>, abbrev: string): number {
  if (abbrev === "RUB") return 1;
  const rub = rates.RUB;
  const cur = rates[abbrev];
  if (!rub || !cur) {
    throw new Error(`Нет курса НБРБ для ${abbrev}`);
  }
  return bynPerUnit(cur) / bynPerUnit(rub);
}

export async function fetchNbrbRate(
  abbrev: string,
  onDate?: string,
): Promise<NbrbRate> {
  const params = new URLSearchParams({ parammode: "2" });
  if (onDate) params.set("ondate", onDate);
  const url = `${NBRB_BASE}/${encodeURIComponent(abbrev)}?${params}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`НБРБ ${abbrev}: HTTP ${res.status}`);
  }
  return res.json() as Promise<NbrbRate>;
}

/** Актуальные курсы EUR, USD, CNY к ₽ (российский рубль). */
export async function fetchRubCrossRates(onDate?: string): Promise<RubCrossRates> {
  const rates = await Promise.all(
    CROSS_CURRENCIES.map((c) => fetchNbrbRate(c, onDate)),
  );
  const map = Object.fromEntries(rates.map((r) => [r.Cur_Abbreviation, r])) as Record<
    string,
    NbrbRate
  >;

  const rateDate = rates[0]?.Date.slice(0, 10) ?? new Date().toISOString().slice(0, 10);

  return {
    rateDate,
    RUB: 1,
    USD: rubPerUnitFromNbrb(map, "USD"),
    EUR: rubPerUnitFromNbrb(map, "EUR"),
    CNY: rubPerUnitFromNbrb(map, "CNY"),
  };
}

/** Перевод между кошельками ₽ ↔ $ по курсу НБРБ на дату операции. */
export async function convertWalletTransfer(
  fromCurrency: "RUB" | "USD",
  fromAmount: number,
  toCurrency: "RUB" | "USD",
  transactionDate: string,
): Promise<{ toAmount: number; exchangeRate: number; rateDate: string }> {
  if (fromCurrency === toCurrency) {
    throw new Error("Кошельки отправителя и получателя должны различаться");
  }

  const rates = await fetchRubCrossRates(transactionDate);
  const usdRate = rates.USD;

  if (fromCurrency === "RUB" && toCurrency === "USD") {
    return {
      toAmount: Math.round((fromAmount / usdRate) * 100) / 100,
      exchangeRate: usdRate,
      rateDate: rates.rateDate,
    };
  }

  return {
    toAmount: Math.round(fromAmount * usdRate * 100) / 100,
    exchangeRate: usdRate,
    rateDate: rates.rateDate,
  };
}

/** Конвертация суммы оплаты в ₽ по курсу НБРБ на дату транзакции. */
export async function convertPaymentToRub(
  paymentCurrency: "RUB" | "USD",
  paymentAmount: number,
  transactionDate: string,
): Promise<{ amountRub: number; exchangeRate: number; rateDate: string }> {
  if (paymentCurrency === "RUB") {
    return {
      amountRub: paymentAmount,
      exchangeRate: 1,
      rateDate: transactionDate,
    };
  }

  const rates = await fetchRubCrossRates(transactionDate);
  const exchangeRate = rates.USD;
  return {
    amountRub: Math.round(paymentAmount * exchangeRate * 100) / 100,
    exchangeRate,
    rateDate: rates.rateDate,
  };
}
