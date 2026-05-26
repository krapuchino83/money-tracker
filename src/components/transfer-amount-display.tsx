"use client";

import { formatCurrency } from "@/lib/currency/format";
import type { Transaction } from "@/lib/types";

type Props = {
  transaction: Transaction;
  className?: string;
};

export function TransferAmountDisplay({ transaction, className }: Props) {
  const { payment_currency, payment_amount, transfer_to_currency, transfer_to_amount, exchange_rate } =
    transaction;

  if (!transfer_to_currency || transfer_to_amount == null) {
    return null;
  }

  return (
    <div className={className}>
      <div className="font-semibold tabular-nums text-foreground">
        −{formatCurrency(payment_amount, payment_currency)}
        <span className="text-muted-foreground mx-1.5 font-normal">→</span>
        +{formatCurrency(transfer_to_amount, transfer_to_currency)}
      </div>
      {exchange_rate > 1 ? (
        <div className="text-muted-foreground mt-0.5 text-xs tabular-nums">
          1 USD = {exchange_rate.toFixed(2)} ₽ · НБРБ
        </div>
      ) : null}
    </div>
  );
}
