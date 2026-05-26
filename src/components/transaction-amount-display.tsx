"use client";

import { formatCurrency } from "@/lib/currency/format";
import type { Transaction } from "@/lib/types";

type Props = {
  transaction: Transaction;
  /** Основная сумма в выбранной валюте отображения (₽ или $). */
  primaryLabel: string;
  className?: string;
};

/** Две строки: основная валюта + исходная валюта оплаты. */
export function TransactionAmountDisplay({ transaction, primaryLabel, className }: Props) {
  const { payment_currency, payment_amount, amount, exchange_rate } = transaction;

  const rubLabel = formatCurrency(amount, "RUB");
  const paymentLabel =
    payment_currency === "USD"
      ? formatCurrency(payment_amount, "USD")
      : rubLabel;

  const showSecondary =
    payment_currency === "USD" || primaryLabel !== rubLabel;

  return (
    <div className={className}>
      <div className="font-semibold tabular-nums">{primaryLabel}</div>
      {showSecondary ? (
        <div className="text-muted-foreground mt-0.5 text-xs tabular-nums">
          {payment_currency === "USD" ? (
            <>
              {paymentLabel}
              <span className="mx-1 opacity-50">·</span>
              {rubLabel}
              {exchange_rate > 1 ? (
                <span className="ml-1 opacity-70">(@ {exchange_rate.toFixed(2)} ₽/$)</span>
              ) : null}
            </>
          ) : (
            rubLabel
          )}
        </div>
      ) : null}
    </div>
  );
}
