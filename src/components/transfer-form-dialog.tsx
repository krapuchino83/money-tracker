"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { addTransfer } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currency/format";
import type { PaymentCurrency, RubCrossRates } from "@/lib/nbrb/types";

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function oppositeWallet(c: PaymentCurrency): PaymentCurrency {
  return c === "RUB" ? "USD" : "RUB";
}

function walletLabel(c: PaymentCurrency): string {
  return c === "RUB" ? "Кошелёк ₽" : "Кошелёк $";
}

export function TransferFormDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fromCurrency, setFromCurrency] = useState<PaymentCurrency>("RUB");
  const [amount, setAmount] = useState("");
  const [transferDate, setTransferDate] = useState(todayInputValue());
  const [rates, setRates] = useState<RubCrossRates | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);

  const toCurrency = oppositeWallet(fromCurrency);

  useEffect(() => {
    let cancelled = false;
    setLoadingRates(true);
    setRateError(null);
    const q = transferDate ? `?date=${encodeURIComponent(transferDate)}` : "";
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
        if (!cancelled) setLoadingRates(false);
      });
    return () => {
      cancelled = true;
    };
  }, [transferDate]);

  const amountNum = Number.parseFloat(amount);
  const validAmount = Number.isFinite(amountNum) && amountNum > 0;
  const usdRate = rates?.USD ?? 0;
  const toAmount =
    validAmount && usdRate > 0
      ? fromCurrency === "RUB"
        ? Math.round((amountNum / usdRate) * 100) / 100
        : Math.round(amountNum * usdRate * 100) / 100
      : 0;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="rounded-full px-5"
        onClick={() => dialogRef.current?.showModal()}
      >
        Перевод
      </Button>

      <dialog
        ref={dialogRef}
        className="fixed inset-0 z-[100] m-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-border/60 bg-card/95 p-0 shadow-2xl ring-1 ring-foreground/[0.06] backdrop:bg-black/45 backdrop:backdrop-blur-[2px] open:flex open:flex-col"
      >
        <div className="border-b border-border/60 px-5 py-4">
          <h2 className="font-display text-lg tracking-tight">Перевод между кошельками</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Конвертация по курсу НБРБ на дату операции.
          </p>
        </div>
        <form
          ref={formRef}
          className="flex flex-col gap-4 p-5"
          action={(fd) => {
            setError(null);
            startTransition(async () => {
              const res = await addTransfer(fd);
              if (res.ok) {
                formRef.current?.reset();
                setFromCurrency("RUB");
                setAmount("");
                setTransferDate(todayInputValue());
                dialogRef.current?.close();
              } else {
                const msg =
                  typeof res.error === "string"
                    ? res.error
                    : JSON.stringify(res.error);
                setError(msg);
              }
            });
          }}
        >
          <div className="grid gap-2">
            <span className="text-sm font-medium">Списать с</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="from_currency"
                  value="RUB"
                  checked={fromCurrency === "RUB"}
                  onChange={() => setFromCurrency("RUB")}
                />
                {walletLabel("RUB")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="from_currency"
                  value="USD"
                  checked={fromCurrency === "USD"}
                  onChange={() => setFromCurrency("USD")}
                />
                {walletLabel("USD")}
              </label>
            </div>
          </div>

          <input type="hidden" name="to_currency" value={toCurrency} />

          <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5 text-sm">
            <p className="text-muted-foreground text-xs">Зачислить на</p>
            <p className="font-medium">{walletLabel(toCurrency)}</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transfer-amount">
              Сумма списания ({fromCurrency === "RUB" ? "₽" : "$"})
            </Label>
            <Input
              id="transfer-amount"
              name="amount"
              type="number"
              min={0.01}
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm">
            {loadingRates ? (
              <p className="text-muted-foreground">Загрузка курса НБРБ…</p>
            ) : rateError ? (
              <p className="text-destructive text-xs">{rateError}</p>
            ) : rates && validAmount ? (
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">
                  Курс НБРБ на {rates.rateDate}: 1 USD = {rates.USD.toFixed(2)} ₽
                </p>
                <p>
                  <span className="text-muted-foreground">Списание: </span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(amountNum, fromCurrency)}
                  </span>
                  <span className="text-muted-foreground mx-2">→</span>
                  <span className="text-muted-foreground">Зачисление: </span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(toAmount, toCurrency)}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">Введите сумму для расчёта.</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transfer-description">Комментарий (необязательно)</Label>
            <Input id="transfer-description" name="description" maxLength={280} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transfer-date">Дата</Label>
            <Input
              id="transfer-date"
              name="date"
              type="date"
              required
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
            />
          </div>

          {error ? <p className="text-destructive text-sm">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => dialogRef.current?.close()}
              disabled={pending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={pending || loadingRates || !validAmount}>
              {pending ? "Перевод…" : "Перевести"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
