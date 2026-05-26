"use client";

import { useEffect, useState } from "react";

import { formatCurrency } from "@/lib/currency/format";
import type { PaymentCurrency, RubCrossRates } from "@/lib/nbrb/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  paymentCurrency: PaymentCurrency;
  onPaymentCurrencyChange: (c: PaymentCurrency) => void;
  paymentAmount: string;
  onPaymentAmountChange: (v: string) => void;
  transactionDate: string;
  idPrefix?: string;
};

export function PaymentAmountFields({
  paymentCurrency,
  onPaymentCurrencyChange,
  paymentAmount,
  onPaymentAmountChange,
  transactionDate,
  idPrefix = "",
}: Props) {
  const [rates, setRates] = useState<RubCrossRates | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setRateError(null);
    const q = transactionDate ? `?date=${encodeURIComponent(transactionDate)}` : "";
    fetch(`/api/exchange-rates${q}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<RubCrossRates>;
      })
      .then((data) => {
        if (!cancelled) setRates(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setRateError(e instanceof Error ? e.message : "Не удалось загрузить курс");
          setRates(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [transactionDate]);

  const amountNum = Number.parseFloat(paymentAmount);
  const validAmount = Number.isFinite(amountNum) && amountNum > 0;
  const rubPerUsd = rates?.USD ?? 0;
  const amountRub =
    paymentCurrency === "RUB"
      ? validAmount
        ? amountNum
        : 0
      : validAmount && rubPerUsd > 0
        ? Math.round(amountNum * rubPerUsd * 100) / 100
        : 0;

  return (
    <>
      <div className="grid gap-2">
        <span className="text-sm font-medium">Валюта оплаты</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={`${idPrefix}payment_currency`}
              value="RUB"
              checked={paymentCurrency === "RUB"}
              onChange={() => onPaymentCurrencyChange("RUB")}
            />
            ₽ Российский рубль
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={`${idPrefix}payment_currency`}
              value="USD"
              checked={paymentCurrency === "USD"}
              onChange={() => onPaymentCurrencyChange("USD")}
            />
            $ Доллар США
          </label>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}payment_amount`}>
          Сумма ({paymentCurrency === "RUB" ? "₽" : "$"})
        </Label>
        <Input
          id={`${idPrefix}payment_amount`}
          name="payment_amount"
          type="number"
          min={0.01}
          step="0.01"
          required
          value={paymentAmount}
          onChange={(e) => onPaymentAmountChange(e.target.value)}
        />
      </div>

      <input type="hidden" name="payment_currency" value={paymentCurrency} />

      <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm">
        {loading ? (
          <p className="text-muted-foreground">Загрузка курса НБРБ…</p>
        ) : rateError ? (
          <p className="text-destructive text-xs">{rateError}</p>
        ) : rates ? (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">
              Курс НБРБ на {rates.rateDate}: 1 USD = {rates.USD.toFixed(2)} ₽
            </p>
            {validAmount ? (
              <p>
                <span className="text-muted-foreground">На счёт (₽): </span>
                <span className="font-medium tabular-nums">{formatCurrency(amountRub, "RUB")}</span>
                {paymentCurrency === "USD" ? (
                  <>
                    <span className="text-muted-foreground mx-2">·</span>
                    <span className="text-muted-foreground">Оплата: </span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(amountNum, "USD")}
                    </span>
                  </>
                ) : null}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">Введите сумму для расчёта.</p>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
